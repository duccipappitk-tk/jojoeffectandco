import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Upload, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Layers, 
  Image as ImageIcon, 
  AlertCircle,
  FolderArchive,
  Check,
  RotateCcw,
  Trash2,
  Tag,
  DollarSign,
  Package,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sliders,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Category, Product, ProductImage } from '../../types';
import { storeService, resolveImageUrl } from '../../services/storeService';
import { bulkIndexedDb, StagedImageRecord, StagedBatchRecord } from '../../utils/indexedDbStorage';

interface AdminBulkUploadPageProps {
  onNavigateAdmin: (route: string) => void;
  onNavigatePublic: (route: string) => void;
}

export interface AiRecognizedProduct {
  id: string; // client temporary ID
  name: string;
  slug: string;
  product_type: string;
  categoryId: string;
  suggestedNewCategory?: string;
  description: string;
  specifications: Record<string, string>;
  colors: string[];
  base_price_input: string; // Strictly blank initially
  sale_price_input: string; // Optional
  stock_quantity_input: string; // Strictly blank initially
  sku: string;
  imageRecords: StagedImageRecord[];
  isApproved: boolean;
  duplicateMatch: Product | null;
  skuCollision: boolean;
  status: 'pending' | 'ready' | 'saved' | 'failed';
  saveMessage?: string;
}

export const isProductEligibleForApproval = (p: { base_price_input?: string; stock_quantity_input?: string }): boolean => {
  if (!p.base_price_input || !p.stock_quantity_input) return false;
  const price = parseFloat(p.base_price_input.trim());
  const stock = parseInt(p.stock_quantity_input.trim(), 10);
  return !isNaN(price) && price > 0 && !isNaN(stock) && stock >= 0;
};

export const AdminBulkUploadPage: React.FC<AdminBulkUploadPageProps> = ({
  onNavigateAdmin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Core Data from Supabase
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Batch & Staged Images (Persisted in IndexedDB)
  const [currentBatch, setCurrentBatch] = useState<StagedBatchRecord | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImageRecord[]>([]);
  const [isExtractingZip, setIsExtractingZip] = useState(false);

  // Processing & Multi-angle Products State
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'review' | 'completed'>('upload');
  const [analyzingIndex, setAnalyzingIndex] = useState<number>(0);
  const [analyzingFilename, setAnalyzingFilename] = useState<string>('');
  const [analyzingStage, setAnalyzingStage] = useState<'idle' | 'uploading' | 'optimizing' | 'gemini' | 'complete' | 'failed'>('idle');
  const [analysisProgressPct, setAnalysisProgressPct] = useState<number>(0);
  const [analysisErrorMsg, setAnalysisErrorMsg] = useState<string>('');
  const [recognizedProducts, setRecognizedProducts] = useState<AiRecognizedProduct[]>([]);
  const [approvedNewCategories, setApprovedNewCategories] = useState<Map<string, boolean>>(new Map());

  // Batch Fill Helpers
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Execution state
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  // 1. Initial Load: Load categories, products, and check for resumable batch in IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, prods] = await Promise.all([
          storeService.getCategories(),
          storeService.getProducts(),
        ]);
        setCategories(cats);
        setExistingProducts(prods);

        // Check if there is an unfinished batch in IndexedDB
        const restored = await bulkIndexedDb.getLatestBatch();
        if (restored && restored.images.length > 0) {
          // Recreate transient in-memory preview URLs for Blobs
          const withUrls = restored.images.map(img => ({
            ...img,
            previewUrl: URL.createObjectURL(img.blob),
          }));
          setCurrentBatch(restored.batch);
          setStagedImages(withUrls);

          if (restored.batch.status === 'ready_for_review') {
            reconstructProductsFromStagedImages(withUrls, cats, prods);
            setCurrentStep('review');
          }
        }
      } catch (e) {
        console.warn('Bulk upload initialization error:', e);
      } finally {
        setLoadingInitial(false);
      }
    };
    init();
  }, []);

  // Generate unique non-colliding SKU
  const generateUniqueSku = (categoryName: string, existingList: Product[]): string => {
    const catCode = categoryName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'JJE';
    let candidate = '';
    let isUnique = false;
    let attempts = 0;

    const existingSkus = new Set(existingList.map(p => (p.sku || '').toUpperCase()));

    while (!isUnique && attempts < 100) {
      attempts++;
      const randNum = Math.floor(1000 + Math.random() * 9000);
      candidate = `JJE-${catCode}-${randNum}`;
      if (!existingSkus.has(candidate)) {
        isUnique = true;
      }
    }
    return candidate;
  };

  // 2. Handle File Selection (Direct Images)
  const handleSelectImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const batchId = currentBatch?.id || `batch_${Date.now()}`;
    const newRecords: StagedImageRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;

      const record: StagedImageRecord = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
        batchId,
        filename: f.name,
        blob: f,
        previewUrl: URL.createObjectURL(f),
        status: 'pending',
      };
      newRecords.push(record);
    }

    const updatedList = [...stagedImages, ...newRecords];
    setStagedImages(updatedList);

    const updatedBatch: StagedBatchRecord = {
      id: batchId,
      createdAt: currentBatch?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalImages: updatedList.length,
      completedImages: updatedList.filter(img => img.status === 'analyzed').length,
      status: 'draft',
    };
    setCurrentBatch(updatedBatch);

    await bulkIndexedDb.saveBatch(updatedBatch);
    await bulkIndexedDb.saveImages(newRecords);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Handle ZIP Archive Extraction directly in browser
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingZip(true);
    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      const batchId = currentBatch?.id || `batch_${Date.now()}`;
      const newRecords: StagedImageRecord[] = [];

      const entries = Object.keys(zipData.files);
      let idx = 0;
      for (const entryPath of entries) {
        const entry = zipData.files[entryPath];
        if (entry.dir) continue;
        if (entryPath.includes('__MACOSX') || entryPath.includes('.DS_Store')) continue;

        const baseName = entryPath.split('/').pop() || entryPath;
        const lower = baseName.toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
          idx++;
          const blob = await entry.async('blob');
          const cleanBlob = new Blob([blob], { type: blob.type || 'image/jpeg' });
          const record: StagedImageRecord = {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${idx}`,
            batchId,
            filename: baseName,
            blob: cleanBlob,
            previewUrl: URL.createObjectURL(cleanBlob),
            status: 'pending',
          };
          newRecords.push(record);
        }
      }

      const updatedList = [...stagedImages, ...newRecords];
      setStagedImages(updatedList);

      const updatedBatch: StagedBatchRecord = {
        id: batchId,
        createdAt: currentBatch?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalImages: updatedList.length,
        completedImages: updatedList.filter(img => img.status === 'analyzed').length,
        status: 'draft',
      };
      setCurrentBatch(updatedBatch);

      await bulkIndexedDb.saveBatch(updatedBatch);
      await bulkIndexedDb.saveImages(newRecords);
    } catch (err: any) {
      setAnalysisErrorMsg(`Failed to extract ZIP: ${err.message}`);
    } finally {
      setIsExtractingZip(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Remove individual photo before processing
  const handleRemovePhoto = async (id: string) => {
    const filtered = stagedImages.filter(img => img.id !== id);
    setStagedImages(filtered);
    await bulkIndexedDb.deleteImage(id);

    if (currentBatch) {
      const updatedBatch = {
        ...currentBatch,
        totalImages: filtered.length,
        updatedAt: new Date().toISOString(),
      };
      setCurrentBatch(updatedBatch);
      await bulkIndexedDb.saveBatch(updatedBatch);
    }
  };

  // Clear entire staged batch
  const handleClearBatch = async () => {
    if (!window.confirm('Clear all staged photographs and reset?')) return;
    if (currentBatch) {
      await bulkIndexedDb.clearBatch(currentBatch.id);
    }
    setCurrentBatch(null);
    setStagedImages([]);
    setRecognizedProducts([]);
    setCurrentStep('upload');
  };

  // 4. Client-side Image Optimization before transmission
  const resizeImageToOptimizedBase64 = (blob: Blob, maxDimension = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(objectUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      };
      img.src = objectUrl;
    });
  };

  // 5. Run AI Vision Analysis Pipeline
  const handleStartAnalysis = async () => {
    if (stagedImages.length === 0) return;

    setCurrentStep('analyzing');
    setAnalyzingStage('uploading');
    setAnalysisErrorMsg('');
    setAnalysisProgressPct(5);

    const token = localStorage.getItem('jojo_admin_session_v1') ? 'admin_session_active' : 'admin_bearer_authenticated';

    const workingImages = [...stagedImages];

    for (let i = 0; i < workingImages.length; i++) {
      const img = workingImages[i];
      if (img.status === 'analyzed' && img.aiResult) {
        continue; // Skip already analyzed images to prevent redundant Gemini API calls
      }

      setAnalyzingIndex(i + 1);
      setAnalyzingFilename(img.filename);
      img.status = 'analyzing';
      setStagedImages([...workingImages]);

      const basePct = Math.round((i / workingImages.length) * 100);
      const stepSlice = Math.round(100 / workingImages.length);

      try {
        // Step A: Upload to Supabase Storage first
        let storageUrl = img.supabaseStorageUrl;
        if (!storageUrl) {
          setAnalyzingStage('uploading');
          setAnalysisProgressPct(Math.min(95, basePct + Math.round(stepSlice * 0.25)));
          img.status = 'uploading_storage';
          setStagedImages([...workingImages]);
          storageUrl = await storeService.uploadImage(img.blob, img.filename);
          img.supabaseStorageUrl = storageUrl;
        }

        // Step B: Send optimized payload to server-side Gemini Vision Endpoint
        setAnalyzingStage('optimizing');
        setAnalysisProgressPct(Math.min(95, basePct + Math.round(stepSlice * 0.5)));
        const optimizedBase64 = await resizeImageToOptimizedBase64(img.blob);

        setAnalyzingStage('gemini');
        setAnalysisProgressPct(Math.min(95, basePct + Math.round(stepSlice * 0.75)));

        const abortCtrl = new AbortController();
        const timeoutTimer = setTimeout(() => abortCtrl.abort(), 35000);

        let response: Response;
        try {
          response = await fetch('/api/ai/analyze-products', {
            method: 'POST',
            signal: abortCtrl.signal,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              imageUrl: storageUrl && storageUrl.startsWith('http') ? storageUrl : undefined,
              imageBase64: optimizedBase64,
              mimeType: 'image/jpeg',
              filename: img.filename,
              availableCategories: categories.map(c => ({ id: c.id, name: c.name })),
            }),
          });
        } finally {
          clearTimeout(timeoutTimer);
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (!data.analysis) {
          throw new Error('AI response did not contain expected product recognition data.');
        }

        // Format specifications dictionary (Section C)
        const specsMap: Record<string, string> = {};
        if (data.analysis.product_type) {
          specsMap['Product Type'] = data.analysis.product_type;
        }
        if (Array.isArray(data.analysis.visible_specifications)) {
          data.analysis.visible_specifications.forEach((spec: any) => {
            if (spec.key && spec.value) {
              specsMap[spec.key.trim()] = spec.value.trim();
            }
          });
        }
        if (Array.isArray(data.analysis.colors_visible) && data.analysis.colors_visible.length > 0 && !specsMap['Colour'] && !specsMap['Color']) {
          specsMap['Colour'] = data.analysis.colors_visible.join(', ');
        }

        img.status = 'analyzed';
        img.errorReason = undefined;
        img.aiSuggestedGroupId = data.analysis.suggested_group_tag || '';
        img.aiResult = {
          product_name: data.analysis.product_name || 'Curated Store Item',
          product_type: data.analysis.product_type || 'Merchandise',
          suggested_category_id: data.analysis.suggested_category_id || '',
          suggested_new_category: data.analysis.suggested_new_category || '',
          description: data.analysis.description || '',
          visible_specifications: specsMap,
          colors_visible: data.analysis.colors_visible || [],
        };

        setAnalysisProgressPct(Math.min(100, Math.round(((i + 1) / workingImages.length) * 100)));

        // Persist update in IndexedDB
        await bulkIndexedDb.updateImage(img);
      } catch (err: any) {
        console.error(`Error analyzing ${img.filename}:`, err);
        img.status = 'failed';
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('timeout') || err.message?.includes('504');
        img.errorReason = isTimeout
          ? 'AI analysis timed out after 35 seconds. Please click Retry.'
          : (err.message || 'Analysis failed. Please click Retry.');
        await bulkIndexedDb.updateImage(img);

        if (err.message?.includes('quota') || err.message?.includes('429')) {
          setAnalysisErrorMsg('Free-tier rate limits reached. Pausing momentarily...');
          await new Promise(r => setTimeout(r, 8000));
        } else {
          setAnalysisErrorMsg(img.errorReason || 'Analysis failed. Please click Retry.');
        }
      }

      setStagedImages([...workingImages]);

      // Modest pause between images to maintain free-tier quota smoothly
      await new Promise(r => setTimeout(r, 600));
    }

    const analyzedList = workingImages.filter(img => img.status === 'analyzed');
    const failedList = workingImages.filter(img => img.status === 'failed');

    if (currentBatch) {
      const updatedBatch: StagedBatchRecord = {
        ...currentBatch,
        completedImages: analyzedList.length,
        status: analyzedList.length > 0 ? 'ready_for_review' : 'draft',
        updatedAt: new Date().toISOString(),
      };
      setCurrentBatch(updatedBatch);
      await bulkIndexedDb.saveBatch(updatedBatch);
    }

    if (analyzedList.length > 0) {
      setAnalyzingStage('complete');
      reconstructProductsFromStagedImages(workingImages, categories, existingProducts);
      setCurrentStep('review');
    } else {
      setAnalyzingStage('failed');
      setAnalysisErrorMsg(failedList[0]?.errorReason || 'Analysis could not be completed. Please click Retry.');
    }
  };

  // 6. Reconstruct Products & Group Multi-angle Images
  const reconstructProductsFromStagedImages = (
    images: StagedImageRecord[],
    catList: Category[],
    prodList: Product[]
  ) => {
    const analyzedOnly = images.filter(img => img.status === 'analyzed' && img.aiResult);
    if (analyzedOnly.length === 0) return;

    // Grouping by AI suggested group tag or filename similarity
    const groups = new Map<string, StagedImageRecord[]>();

    analyzedOnly.forEach(img => {
      let groupKey = img.aiSuggestedGroupId?.trim().toLowerCase();
      if (!groupKey) {
        // Fallback: use first 8 characters of clean filename
        groupKey = img.filename.replace(/[0-9_\-\.\s]/g, '').slice(0, 8).toLowerCase() || img.id;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(img);
    });

    const products: AiRecognizedProduct[] = [];
    const newCategoriesMap = new Map<string, boolean>();

    let idx = 0;
    for (const [, groupImages] of groups.entries()) {
      idx++;
      const primaryImage = groupImages[0];
      const aiData = primaryImage.aiResult!;

      // Category matching
      let assignedCatId = aiData.suggested_category_id;
      if (!catList.some(c => c.id === assignedCatId)) {
        // If not found in current categories
        if (aiData.suggested_new_category) {
          assignedCatId = '';
          newCategoriesMap.set(aiData.suggested_new_category, false);
        } else {
          assignedCatId = catList[0]?.id || '';
        }
      }

      const generatedSlug = aiData.product_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `product-${Date.now()}-${idx}`;

      const duplicate = prodList.find(p => 
        p.name.toLowerCase().trim() === aiData.product_name.toLowerCase().trim() ||
        p.slug === generatedSlug
      ) || null;

      const catName = catList.find(c => c.id === assignedCatId)?.name || 'Store';
      const sku = generateUniqueSku(catName, prodList);

      products.push({
        id: `prod_ai_${Date.now()}_${idx}`,
        name: aiData.product_name,
        slug: generatedSlug,
        product_type: aiData.product_type,
        categoryId: assignedCatId,
        suggestedNewCategory: aiData.suggested_new_category,
        description: aiData.description,
        specifications: aiData.visible_specifications,
        colors: aiData.colors_visible,
        base_price_input: '', // STRICTLY BLANK initially per instructions
        sale_price_input: '',
        stock_quantity_input: '', // STRICTLY BLANK initially per instructions
        sku,
        imageRecords: groupImages,
        isApproved: false, // STRICTLY unchecked by default per requirements
        duplicateMatch: duplicate,
        skuCollision: prodList.some(p => p.sku === sku),
        status: 'pending',
      });
    }

    setRecognizedProducts(products);
    setApprovedNewCategories(newCategoriesMap);
  };

  // Group Management: Detach an image into its own separate product listing
  const handleDetachImageToNewProduct = (productId: string, imageId: string) => {
    const sourceProd = recognizedProducts.find(p => p.id === productId);
    if (!sourceProd || sourceProd.imageRecords.length <= 1) return;

    const detachedImage = sourceProd.imageRecords.find(i => i.id === imageId);
    if (!detachedImage) return;

    const remainingImages = sourceProd.imageRecords.filter(i => i.id !== imageId);
    const aiData = detachedImage.aiResult || sourceProd;

    const newProd: AiRecognizedProduct = {
      id: `prod_ai_${Date.now()}_detached`,
      name: `${sourceProd.name} (View)`,
      slug: `${sourceProd.slug}-alt-${Date.now().toString().slice(-4)}`,
      product_type: sourceProd.product_type,
      categoryId: sourceProd.categoryId,
      description: sourceProd.description,
      specifications: { ...sourceProd.specifications },
      colors: [...sourceProd.colors],
      base_price_input: sourceProd.base_price_input,
      sale_price_input: sourceProd.sale_price_input,
      stock_quantity_input: sourceProd.stock_quantity_input,
      sku: generateUniqueSku('Alt', existingProducts),
      imageRecords: [detachedImage],
      isApproved: false, // STRICTLY unchecked by default
      duplicateMatch: null,
      skuCollision: false,
      status: 'pending',
    };

    setRecognizedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, imageRecords: remainingImages } : p).concat(newProd)
    );
  };

  // Field Edit Handler
  const handleUpdateProductField = (productId: string, field: keyof AiRecognizedProduct, value: any) => {
    setRecognizedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = { ...p, [field]: value };
        // If price or stock is changed to an invalid value, product can no longer be approved
        if ((field === 'base_price_input' || field === 'stock_quantity_input') && !isProductEligibleForApproval(updated)) {
          updated.isApproved = false;
        }
        // If approval was toggled, disallow true unless strictly eligible
        if (field === 'isApproved' && value === true && !isProductEligibleForApproval(updated)) {
          updated.isApproved = false;
        }
        return updated;
      }
      return p;
    }));
  };

  // Specification Handlers (Fully editable structured specifications)
  const handleUpdateProductSpec = (productId: string, oldKey: string, newKey: string, newValue: string) => {
    setRecognizedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextSpecs: Record<string, string> = {};
        const entries = Object.entries(p.specifications || {});
        let keyReplaced = false;

        for (const [k, v] of entries) {
          if (k === oldKey) {
            if (newKey.trim()) {
              nextSpecs[newKey.trim()] = newValue;
              keyReplaced = true;
            }
          } else {
            nextSpecs[k] = v;
          }
        }

        if (!keyReplaced && newKey.trim()) {
          nextSpecs[newKey.trim()] = newValue;
        }

        return { ...p, specifications: nextSpecs };
      }
      return p;
    }));
  };

  const handleDeleteProductSpec = (productId: string, keyToDelete: string) => {
    setRecognizedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextSpecs = { ...(p.specifications || {}) };
        delete nextSpecs[keyToDelete];
        return { ...p, specifications: nextSpecs };
      }
      return p;
    }));
  };

  const handleAddProductSpec = (productId: string) => {
    setRecognizedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const currentSpecs = p.specifications || {};
        let newKey = 'Attribute';
        let counter = 1;
        while (Object.prototype.hasOwnProperty.call(currentSpecs, newKey)) {
          newKey = `Attribute ${counter++}`;
        }
        return {
          ...p,
          specifications: {
            ...currentSpecs,
            [newKey]: '',
          }
        };
      }
      return p;
    }));
  };

  // Batch Fill Toolbar (e.g. set price & stock for selected items)
  const handleApplyBatchFill = () => {
    if (!bulkPriceValue && !bulkStockValue) return;

    setRecognizedProducts(prev => prev.map(p => {
      if (selectedProductIds.size === 0 || selectedProductIds.has(p.id)) {
        const updated = {
          ...p,
          base_price_input: bulkPriceValue ? bulkPriceValue : p.base_price_input,
          stock_quantity_input: bulkStockValue ? bulkStockValue : p.stock_quantity_input,
        };
        // Reset approval if the update made it ineligible
        if (!isProductEligibleForApproval(updated)) {
          updated.isApproved = false;
        }
        return updated;
      }
      return p;
    }));
  };

  // Toggle selection
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 7. Save Approved Products to Supabase
  const handleSaveApprovedProducts = async () => {
    const toSave = recognizedProducts.filter(p => p.isApproved && isProductEligibleForApproval(p));
    if (toSave.length === 0) {
      alert('Please enter a valid selling price (> $0) and stock quantity (≥ 0), then check "Approve Product" for at least one item before saving.');
      return;
    }

    // Validation: Ensure all approved products have price and stock
    const missingPriceOrStock = toSave.filter(p => 
      !p.base_price_input || parseFloat(p.base_price_input) <= 0 ||
      !p.stock_quantity_input || isNaN(parseInt(p.stock_quantity_input, 10))
    );

    if (missingPriceOrStock.length > 0) {
      alert(`Cannot save: ${missingPriceOrStock.length} product(s) are missing Selling Price or Stock Quantity. Please complete price and stock before publishing.`);
      return;
    }

    setIsSavingAll(true);
    setSaveProgress({ current: 0, total: toSave.length });

    // Step A: Create approved new categories
    const catMap = new Map<string, string>();
    categories.forEach(c => catMap.set(c.id, c.id));

    for (const [newCatName, isApproved] of approvedNewCategories.entries()) {
      if (isApproved) {
        const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const newCat: Category = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: newCatName,
          slug: catSlug,
          description: `Curated ${newCatName} collection at JO JO EFFECTS & CO.`,
          image_url: '/images/hero_luxe_collection.jpg',
          is_active: true,
          display_order: categories.length + 1,
        };
        try {
          await storeService.saveCategory(newCat);
          setCategories(prev => [...prev, newCat]);
          catMap.set(newCatName, newCat.id);
        } catch (e) {
          console.error(`Failed to save category ${newCatName}:`, e);
        }
      }
    }

    // Step B: Save Products to Supabase
    const updatedProducts = [...recognizedProducts];

    for (let i = 0; i < toSave.length; i++) {
      const item = toSave[i];
      setSaveProgress({ current: i + 1, total: toSave.length });

      try {
        // Build gallery images array from Supabase Storage URLs
        const finalImages: ProductImage[] = item.imageRecords.map((rec, imgIdx) => ({
          id: `img_${Date.now()}_${imgIdx}`,
          url: rec.supabaseStorageUrl || '/images/hero_luxe_collection.jpg',
          alt_text: item.name,
          is_primary: imgIdx === 0,
          display_order: imgIdx + 1,
        }));

        let finalCatId = item.categoryId;
        if (!finalCatId && item.suggestedNewCategory && catMap.has(item.suggestedNewCategory)) {
          finalCatId = catMap.get(item.suggestedNewCategory)!;
        } else if (!finalCatId) {
          finalCatId = categories[0]?.id || 'cat-womens-hair';
        }

        const productPayload: Product = {
          id: item.duplicateMatch ? item.duplicateMatch.id : `prod_${Date.now()}_${i}`,
          category_id: finalCatId,
          name: item.name.trim(),
          slug: item.slug.trim(),
          sku: item.sku.trim(),
          description: item.description.trim(),
          specifications: item.specifications,
          base_price: parseFloat(item.base_price_input),
          sale_price: item.sale_price_input ? parseFloat(item.sale_price_input) : null,
          stock_quantity: parseInt(item.stock_quantity_input, 10),
          is_published: true,
          is_featured: false,
          is_new_arrival: true,
          images: finalImages,
          variants: [],
          created_at: item.duplicateMatch ? item.duplicateMatch.created_at : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const result = await storeService.saveProduct(productPayload);

        const target = updatedProducts.find(p => p.id === item.id);
        if (target) {
          target.status = 'saved';
          target.saveMessage = result.supabaseSyncError 
            ? `Saved locally. Supabase note: ${result.supabaseSyncError}` 
            : 'Saved and published to Supabase!';
        }
      } catch (err: any) {
        console.error(`Error saving product ${item.name}:`, err);
        const target = updatedProducts.find(p => p.id === item.id);
        if (target) {
          target.status = 'failed';
          target.saveMessage = `Error: ${err.message || 'Unknown save error'}`;
        }
      }

      setRecognizedProducts([...updatedProducts]);
    }

    if (currentBatch) {
      const updatedBatch: StagedBatchRecord = {
        ...currentBatch,
        status: 'imported',
        updatedAt: new Date().toISOString(),
      };
      await bulkIndexedDb.saveBatch(updatedBatch);
    }

    setIsSavingAll(false);
    setCurrentStep('completed');
  };

  if (loadingInitial) {
    return (
      <div className="p-8 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
        Loading AI Recognition System...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAdmin('/admin/products')}
            className="p-2 text-neutral-600 hover:text-[#111111] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Back to Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
                Next-Gen Merchandising
              </span>
              <span className="px-2 py-0.5 bg-[#D4AF62]/15 text-[#111111] text-[10px] font-bold uppercase tracking-wider rounded">
                Gemini 3.1 Flash Lite Vision | Fallback: 3.8 Flash
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#111111] uppercase tracking-wider">
              AI Image-to-Product Generator
            </h1>
          </div>
        </div>

        {/* Batch actions / status */}
        <div className="flex items-center gap-3">
          {stagedImages.length > 0 && currentStep === 'upload' && (
            <button
              type="button"
              onClick={handleClearBatch}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded border border-red-200 hover:bg-red-50"
            >
              Reset Batch ({stagedImages.length})
            </button>
          )}

          {currentStep === 'review' && (
            <button
              type="button"
              onClick={() => setCurrentStep('upload')}
              className="text-xs text-neutral-600 hover:text-[#111111] font-semibold px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-50"
            >
              + Add More Images
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
        <Info className="w-4 h-4 text-[#D4AF62] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#111111]">Privacy &amp; Zero Cost Guarantee:</span> Uploaded product photographs are analyzed using Google's free-tier Gemini 3.1 Flash Lite Vision model (with resilient fallback to Gemini 3.8 Flash). No paid billing will be incurred. Only public commercial merchandise is analyzed; customer and payment details are never shared with AI models.
        </div>
      </div>

      {/* STEP 1: Upload & Staging Grid */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          
          {/* Main Dropzone */}
          <div className="p-10 bg-white rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#D4AF62] transition-all flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#111111] text-[#D4AF62] flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-base font-extrabold text-[#111111] uppercase tracking-wider mb-1">
              Upload Product Photographs
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
              Select multiple photos or upload a ZIP archive. The AI will inspect every image, recognize item types, generate names &amp; descriptions, and group multi-angle shots.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Select Multiple Photos</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleSelectImages}
              />

              <button
                type="button"
                onClick={() => zipInputRef.current?.click()}
                disabled={isExtractingZip}
                className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-[#111111] text-[#111111] rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
              >
                <FolderArchive className="w-4 h-4 text-[#D4AF62]" />
                <span>{isExtractingZip ? 'Unpacking ZIP...' : 'Upload ZIP Archive'}</span>
              </button>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={handleZipUpload}
              />
            </div>

            <span className="text-[10px] text-neutral-400 mt-4 block">
              Supports JPG, JPEG, PNG, and WEBP. Drag-and-drop 10 to 50+ photos per batch.
            </span>
          </div>

          {/* Staged Photographs Grid */}
          {stagedImages.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Staged Photographs ({stagedImages.length})
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Review and remove any unwanted images before starting AI product recognition.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded-md inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze {stagedImages.length} Photos with AI</span>
                </button>
              </div>

              {/* Grid with delete overlays */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {stagedImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg border border-neutral-200 overflow-hidden group bg-neutral-100">
                    <img
                      src={img.previewUrl}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(img.id)}
                        className="p-1.5 bg-white text-red-600 rounded-full shadow hover:bg-red-50"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded truncate">
                      {img.filename}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* STEP 2: Real-time Analysis Progress & Retry Interface */}
      {currentStep === 'analyzing' && (
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-xl max-w-lg mx-auto text-center space-y-6">
          {analyzingStage === 'failed' ? (
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#111111] text-[#D4AF62] mx-auto flex items-center justify-center animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
          )}

          <div>
            <h2 className="text-base font-extrabold text-[#111111] uppercase tracking-wider">
              {analyzingStage === 'failed' ? 'Analysis Paused or Timed Out' : 'Analyzing Photographs...'}
            </h2>
            <p className="text-xs text-neutral-600 mt-1.5">
              {analyzingStage === 'uploading' && 'Step 1/3: Storing image securely in Supabase Storage...'}
              {analyzingStage === 'optimizing' && 'Step 2/3: Optimizing resolution for Gemini Vision...'}
              {analyzingStage === 'gemini' && 'Step 3/3: Gemini AI Vision (3.1 Flash Lite / 3.8 Flash) extracting styling & visible features...'}
              {analyzingStage === 'complete' && 'All photographs analyzed successfully!'}
              {analyzingStage === 'failed' && (analysisErrorMsg || 'The AI request timed out or encountered an issue.')}
            </p>
            {analyzingFilename && analyzingStage !== 'failed' && (
              <p className="text-[11px] font-mono text-neutral-400 mt-1 truncate max-w-xs mx-auto">
                Photo {analyzingIndex} of {stagedImages.length} — {analyzingFilename}
              </p>
            )}
          </div>

          {/* Real-time Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden border border-neutral-200 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  analyzingStage === 'failed' ? 'bg-red-500' : 'bg-[#D4AF62]'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, analysisProgressPct))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{analysisProgressPct}% complete</span>
              <span>Photo {analyzingIndex} of {stagedImages.length}</span>
            </div>
          </div>

          {analysisErrorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl text-left flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Status Diagnostic</span>
                <span className="block text-[11px] leading-relaxed text-amber-800">{analysisErrorMsg}</span>
              </div>
            </div>
          )}

          {/* Action buttons during or after failure */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {analyzingStage === 'failed' ? (
              <>
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('upload')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-neutral-300 hover:border-[#111111] text-[#111111] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Back to Staged Photos
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep('upload')}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline transition-colors cursor-pointer"
              >
                Cancel &amp; return to photo staging
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: AI Product Review Dashboard */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          
          {/* Failed Photos Alert & Retry Action */}
          {stagedImages.some(img => img.status === 'failed') && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    {stagedImages.filter(img => img.status === 'failed').length} Photograph(s) Require Retry
                  </span>
                  <span className="text-[11px] text-amber-700 block">
                    {stagedImages.find(img => img.status === 'failed')?.errorReason || 'Timeout or network issue'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="px-3.5 py-2 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Failed Photos</span>
                </button>
              </div>
            </div>
          )}

          {/* Batch Fill Toolbar */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF62]" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                  Quick Batch Pricing &amp; Stock Tool
                </span>
                <span className="text-[11px] text-neutral-500">
                  Apply selling price and stock quantity across all or selected items.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-300 rounded px-2 py-1">
                <span className="text-xs text-neutral-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Set Price"
                  value={bulkPriceValue}
                  onChange={e => setBulkPriceValue(e.target.value)}
                  className="w-20 text-xs bg-transparent focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-300 rounded px-2 py-1">
                <Package className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="number"
                  placeholder="Set Stock"
                  value={bulkStockValue}
                  onChange={e => setBulkStockValue(e.target.value)}
                  className="w-20 text-xs bg-transparent focus:outline-none font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyBatchFill}
                className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-semibold rounded cursor-pointer"
              >
                Apply to {selectedProductIds.size > 0 ? `${selectedProductIds.size} Selected` : 'All Products'}
              </button>
            </div>
          </div>

          {/* New Categories Approval Notice */}
          {approvedNewCategories.size > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Suggested New Store Categories
              </span>
              <p className="text-xs text-amber-800">
                The AI identified items that may belong to new categories. Check the box to approve category creation in Supabase:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from(approvedNewCategories.entries()).map(([catName, isApproved]) => (
                  <label key={catName} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={() => {
                        setApprovedNewCategories(prev => {
                          const next = new Map(prev);
                          next.set(catName, !next.get(catName));
                          return next;
                        });
                      }}
                      className="rounded text-[#111111] focus:ring-[#D4AF62]"
                    />
                    <span>{catName}</span>
                    <span className="text-[10px] text-amber-700">({isApproved ? 'Approved' : 'Do Not Create'})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Product Cards List */}
          <div className="space-y-4">
            {recognizedProducts.map((product, pIdx) => {
              const isMissingData = !product.base_price_input || !product.stock_quantity_input;

              return (
                <div 
                  key={product.id}
                  className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                    isMissingData ? 'border-amber-300 bg-amber-50/10' : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    
                    {/* Left: Gallery & Multi-angle Detach Control */}
                    <div className="w-full lg:w-48 shrink-0 space-y-2">
                      <div className="relative aspect-square rounded-lg border border-neutral-200 overflow-hidden bg-neutral-100">
                        <img
                          src={product.imageRecords[0]?.previewUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#D4AF62] text-[#111111] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                          Cover Photo
                        </span>
                      </div>

                      {/* Multi-angle Secondary Photos */}
                      {product.imageRecords.length > 1 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                            Additional Angles ({product.imageRecords.length - 1}):
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {product.imageRecords.slice(1).map((subImg) => (
                              <div key={subImg.id} className="relative group shrink-0">
                                <img
                                  src={subImg.previewUrl}
                                  alt="angle"
                                  className="w-12 h-12 object-cover rounded border border-neutral-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDetachImageToNewProduct(product.id, subImg.id)}
                                  className="absolute -top-1 -right-1 bg-white border border-neutral-300 text-neutral-600 rounded-full p-0.5 shadow hover:bg-neutral-100"
                                  title="Detach photo to separate product listing"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center: Details & Editable Content */}
                    <div className="flex-1 space-y-4 w-full">
                      
                      {/* Top Action & Approval Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-neutral-900 text-[#D4AF62] text-[10px] font-extrabold uppercase tracking-wider rounded">
                            {product.product_type || 'Merchandise'}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {product.imageRecords.length} photo{product.imageRecords.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {(() => {
                          const isEligible = isProductEligibleForApproval(product);
                          return (
                            <div className="flex items-center gap-2 shrink-0">
                              {!isEligible && (
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Enter price (&gt; $0) &amp; stock (&ge; 0) to approve
                                </span>
                              )}
                              <label
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 select-none ${
                                  isEligible ? 'cursor-pointer text-[#111111]' : 'cursor-not-allowed text-neutral-400'
                                }`}
                                title={isEligible ? 'Toggle product approval for publishing' : 'Selling price (> $0) and stock quantity (≥ 0) required before approval'}
                              >
                                <input
                                  type="checkbox"
                                  disabled={!isEligible}
                                  checked={Boolean(product.isApproved && isEligible)}
                                  onChange={e => {
                                    if (isEligible) {
                                      handleUpdateProductField(product.id, 'isApproved', e.target.checked);
                                    }
                                  }}
                                  className="rounded text-[#111111] focus:ring-[#D4AF62] disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                                <span>Approve Product</span>
                              </label>
                            </div>
                          );
                        })()}
                      </div>

                      {/* SECTION A: PRODUCT NAME (Searchable Title) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#111111] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#111111] text-[#D4AF62] inline-flex items-center justify-center text-[9px] font-extrabold">A</span>
                            <span>Product Name (Searchable Title) *</span>
                          </label>
                          <span className="text-neutral-400 font-normal lowercase text-[10px]">editable</span>
                        </div>
                        <input
                          type="text"
                          value={product.name}
                          onChange={e => handleUpdateProductField(product.id, 'name', e.target.value)}
                          placeholder="e.g. Monogram Cherry Print Tote Bag with Matching Pouch"
                          className="font-bold text-sm text-[#111111] bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 focus:bg-white focus:border-[#D4AF62] w-full"
                        />
                      </div>

                      {/* Store Category & SKU Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                            Store Category
                          </label>
                          <select
                            value={product.categoryId}
                            onChange={e => handleUpdateProductField(product.id, 'categoryId', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] focus:bg-white"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            {product.suggestedNewCategory && (
                              <option value="">{product.suggestedNewCategory} (New Suggestion)</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                            SKU Identifier
                          </label>
                          <input
                            type="text"
                            value={product.sku}
                            onChange={e => handleUpdateProductField(product.id, 'sku', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs font-mono text-[#111111] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* SECTION B: PRODUCT DESCRIPTION (Commercial Retail Copy) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#111111] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#111111] text-[#D4AF62] inline-flex items-center justify-center text-[9px] font-extrabold">B</span>
                            <span>Product Description (Commercial Retail Copy) *</span>
                          </label>
                          <span className="text-neutral-400 font-normal lowercase text-[10px]">editable</span>
                        </div>
                        <textarea
                          rows={3}
                          value={product.description}
                          onChange={e => handleUpdateProductField(product.id, 'description', e.target.value)}
                          placeholder="Concise commercial description identifying product type, styling, distinctive features, visible hardware, and included accessories..."
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-[#111111] focus:bg-white focus:border-[#D4AF62] leading-relaxed"
                        />
                      </div>

                      {/* SECTION C: PRODUCT SPECIFICATIONS (Structured & Fully Editable) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-[#111111] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#111111] text-[#D4AF62] inline-flex items-center justify-center text-[9px] font-extrabold">C</span>
                            <span>Product Specifications (Tailored to {product.product_type || 'Item'})</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddProductSpec(product.id)}
                            className="text-[11px] font-semibold text-[#111111] hover:text-[#D4AF62] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Specification</span>
                          </button>
                        </div>

                        {Object.entries(product.specifications || {}).length === 0 ? (
                          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center text-xs text-neutral-400">
                            No specifications listed yet. Click "+ Add Specification" to add attributes.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                            {Object.entries(product.specifications || {}).map(([specKey, specVal], sIdx) => (
                              <div key={`${product.id}-spec-${sIdx}`} className="flex items-center gap-1 bg-white p-1 rounded border border-neutral-200 shadow-2xs">
                                <input
                                  type="text"
                                  value={specKey}
                                  onChange={e => handleUpdateProductSpec(product.id, specKey, e.target.value, specVal)}
                                  placeholder="Attribute"
                                  className="w-2/5 text-[11px] font-semibold text-neutral-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 focus:bg-white focus:border-[#D4AF62]"
                                />
                                <span className="text-neutral-400 font-bold text-xs">:</span>
                                <input
                                  type="text"
                                  value={specVal}
                                  onChange={e => handleUpdateProductSpec(product.id, specKey, specKey, e.target.value)}
                                  placeholder="Observed Value"
                                  className="flex-1 text-[11px] text-[#111111] bg-white px-2 py-1 rounded border border-neutral-200 focus:border-[#D4AF62]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProductSpec(product.id, specKey)}
                                  className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                  title="Remove specification"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* REQUIRED PRICING & STOCK ROW (Starts strictly blank!) */}
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-[#111111] uppercase tracking-wider text-[10px] block mb-1">
                            Selling Price ($ USD) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Enter Price"
                            required
                            value={product.base_price_input}
                            onChange={e => handleUpdateProductField(product.id, 'base_price_input', e.target.value)}
                            className={`w-full px-2.5 py-1.5 bg-white border rounded text-xs font-mono text-[#111111] ${
                              !product.base_price_input ? 'border-amber-400 bg-amber-50/30' : 'border-neutral-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                            Sale Price ($ USD, Optional)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Optional sale"
                            value={product.sale_price_input}
                            onChange={e => handleUpdateProductField(product.id, 'sale_price_input', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs font-mono text-[#111111]"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[#111111] uppercase tracking-wider text-[10px] block mb-1">
                            Available Stock Quantity *
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Enter Stock"
                            required
                            value={product.stock_quantity_input}
                            onChange={e => handleUpdateProductField(product.id, 'stock_quantity_input', e.target.value)}
                            className={`w-full px-2.5 py-1.5 bg-white border rounded text-xs font-mono text-[#111111] ${
                              !product.stock_quantity_input ? 'border-amber-400 bg-amber-50/30' : 'border-neutral-300'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Warnings / Status */}
                      {isMissingData && (
                        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Selling price and stock quantity are required before publishing.</span>
                        </div>
                      )}

                      {product.duplicateMatch && (
                        <div className="flex items-center gap-1.5 text-blue-700 text-xs">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Matches existing store product: "{product.duplicateMatch.name}". Saving will update this record.</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setCurrentStep('upload')}
              className="px-5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md"
            >
              &larr; Back to Photo Staging
            </button>

            {(() => {
              const approvedCount = recognizedProducts.filter(p => p.isApproved && isProductEligibleForApproval(p)).length;
              return (
                <button
                  type="button"
                  onClick={handleSaveApprovedProducts}
                  disabled={isSavingAll || approvedCount === 0}
                  className="px-8 py-3 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-extrabold uppercase tracking-widest rounded-md shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {approvedCount > 0
                      ? `Save & Publish ${approvedCount} Approved Product${approvedCount > 1 ? 's' : ''} to Store`
                      : 'Approve Validated Products to Publish'}
                  </span>
                </button>
              );
            })()}
          </div>

        </div>
      )}

      {/* STEP 4: Completed Summary */}
      {currentStep === 'completed' && (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[#111111] uppercase tracking-wider">
              Batch Merchandising Completed!
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {saveProgress.current} product listings were processed and synced to Supabase.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStagedImages([]);
                setRecognizedProducts([]);
                setCurrentStep('upload');
              }}
              className="px-5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md"
            >
              Upload Another Photo Batch
            </button>
            <button
              type="button"
              onClick={() => onNavigateAdmin('/admin/products')}
              className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded-md shadow-md"
            >
              View In Catalog &rarr;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
