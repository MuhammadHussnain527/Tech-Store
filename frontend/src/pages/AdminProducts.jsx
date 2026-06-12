import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Search, Package, LayoutGrid, List, ImageOff } from 'lucide-react';
import { adminApi, resolveImageUrl } from '../services/api';

const EMPTY = {
  productId: 0, categoryId: '', name: '', brand: '',
  price: '', stockQty: '', description: '', specs: '', imageUrl: '', active: true,
};

const STOCK_STYLE = qty =>
  qty === 0 ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
    qty <= 5 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [catFilter, setCatFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminApi.getAllProducts(), adminApi.getAllCategories()]);
      setProducts(p.data ?? []);
      setCategories(c.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = prod => { setForm({ ...EMPTY, ...prod, description: prod.description || '', specs: prod.specs || '', brand: prod.brand || '', imageUrl: prod.imageUrl || '' }); setError(''); setModal('edit'); };
  const close = () => { setModal(null); setError(''); };
  const handle = e => setForm(f => ({
    ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }));

  const handleImageUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const res = await adminApi.uploadImage(file);
      setForm(f => ({ ...f, imageUrl: res.data?.imageUrl ?? '' }));
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJVjdfNf40AwaxAmTg4VoYuDFyxDxo_qXLVg&s',
        price: Number(form.price),
        stockQty: Number(form.stockQty),
        categoryId: Number(form.categoryId),
      };
      if (modal === 'add') await adminApi.createProduct(payload);
      else await adminApi.updateProduct(payload);
      close(); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try { await adminApi.deleteProduct(deleteId); load(); } catch (err) { alert(err.message); }
    finally { setDeleteId(null); }
  };

  const previewUrl = form.imageUrl ? resolveImageUrl(form.imageUrl) : '';

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || String(p.categoryId) === catFilter;
    return matchSearch && matchCat;
  });

  const catName = id => categories.find(c => c.categoryId === id)?.name ?? '—';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight-900 dark:text-white">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} of {products.length} products</p>
        </div>
        <button id="add-product-btn" onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-9 bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600"
          />
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-slate-600 dark:text-slate-300 w-40"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </select>
        <div className="flex rounded-xl border border-midnight-200 dark:border-white/10 overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:text-white hover:bg-midnight-100 dark:bg-white/5'}`}
          ><List size={16} /></button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:text-white hover:bg-midnight-100 dark:bg-white/5'}`}
          ><LayoutGrid size={16} /></button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-midnight-100 dark:bg-white/5 animate-pulse border border-midnight-200 dark:border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-500">
          <Package size={48} className="mb-4 opacity-30" />
          <p className="font-serif text-xl text-midnight-900 dark:text-white">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => (
            <div key={p.productId}
              className="rounded-2xl border border-midnight-200 dark:border-white/5 overflow-hidden hover:border-midnight-300 dark:border-white/15 transition-all duration-200 group"
            >
              <div className="relative aspect-square bg-midnight-100 dark:bg-white/5 overflow-hidden">
                {p.imageUrl
                  ? <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
                }
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-obsidian-900/90 text-slate-600 dark:text-slate-300 hover:text-gold-400 border border-midnight-200 dark:border-white/10">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setDeleteId(p.productId)} className="p-1.5 rounded-lg bg-obsidian-900/90 text-slate-600 dark:text-slate-300 hover:text-red-400 border border-midnight-200 dark:border-white/10">
                    <Trash2 size={12} />
                  </button>
                </div>
                {!p.active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-xs font-bold text-red-400 border border-red-400/30 px-2 py-0.5 rounded-lg bg-red-900/30">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-midnight-900 dark:text-white font-semibold text-sm truncate mb-0.5">{p.name}</p>
                <p className="text-slate-500 text-xs mb-2">{p.brand || catName(p.categoryId)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gold-400 font-bold text-sm">PKR {Number(p.price).toLocaleString()}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${STOCK_STYLE(p.stockQty)}`}>
                    {p.stockQty === 0 ? 'OUT' : p.stockQty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="rounded-2xl border border-midnight-200 dark:border-white/5 overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-midnight-200 dark:border-white/5">
                  {['Image', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.productId} className="border-b border-white/3 hover:bg-midnight-50 dark:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      {p.imageUrl
                        ? <img src={resolveImageUrl(p.imageUrl)} alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-midnight-200 dark:border-white/10" />
                        : <div className="w-12 h-12 rounded-xl bg-midnight-100 dark:bg-white/5 flex items-center justify-center border border-midnight-200 dark:border-white/5">
                          <ImageOff size={16} className="text-slate-600" />
                        </div>
                      }
                    </td>
                    <td className="px-4 py-3 text-midnight-900 dark:text-white font-semibold max-w-[180px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{catName(p.categoryId)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.brand || '—'}</td>
                    <td className="px-4 py-3 text-gold-400 font-bold">PKR {Number(p.price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STOCK_STYLE(p.stockQty)}`}>
                        {p.stockQty === 0 ? 'Out of Stock' : `${p.stockQty}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${p.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                        }`}>{p.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors border border-midnight-200 dark:border-white/5 hover:border-gold-500/20">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(p.productId)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-midnight-200 dark:border-white/5 hover:border-red-500/20">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="rounded-2xl border border-midnight-200 dark:border-white/10 p-6 w-full max-w-sm shadow-2xl bg-white dark:bg-obsidian-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-midnight-900 dark:text-white font-bold">Delete Product?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">This will deactivate the product listing.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="rounded-2xl border border-midnight-200 dark:border-white/10 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl bg-white dark:bg-obsidian-900">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-midnight-200 dark:border-white/5 bg-white dark:bg-obsidian-900" style={{ zIndex: 1 }}>
              <h2 className="text-xl font-bold text-midnight-900 dark:text-white font-serif">{modal === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <button onClick={close} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:text-white hover:bg-midnight-100 dark:bg-white/5 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                  <X size={14} className="flex-shrink-0 mt-0.5" />{error}
                </div>
              )}

              <form onSubmit={save} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Category *</label>
                  <select name="categoryId" value={form.categoryId} onChange={handle} required
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                  </select>
                </div>

                {/* Name + Brand */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'name', label: 'Product Name *', type: 'text', required: true },
                    { name: 'brand', label: 'Brand', type: 'text', required: false },
                  ].map(({ name, label, type, required }) => (
                    <div key={name}>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">{label}</label>
                      <input name={name} type={type} value={form[name]} onChange={handle}
                        placeholder={label.replace(' *', '')} className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600"
                        required={required} />
                    </div>
                  ))}
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'price', label: 'Price (PKR) *', type: 'number', step: '0.01' },
                    { name: 'stockQty', label: 'Stock Qty *', type: 'number', step: '1' },
                  ].map(({ name, label, type, step }) => (
                    <div key={name}>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">{label}</label>
                      <input name={name} type={type} value={form[name]} onChange={handle}
                        placeholder="0" min={0} step={step}
                        className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600" required />
                    </div>
                  ))}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold uppercase tracking-widest">Product Image</label>
                  <div className="flex gap-3 items-start">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl border border-midnight-200 dark:border-white/10 bg-midnight-100 dark:bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {previewUrl
                        ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        : <ImageOff size={20} className="text-slate-600" />
                      }
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 btn-secondary py-2 px-4 text-sm cursor-pointer">
                        <Upload size={14} />
                        {uploading ? 'Uploading…' : 'Upload Image'}
                        <input type="file" accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                      <input name="imageUrl" type="url" value={form.imageUrl} onChange={handle}
                        placeholder="Or paste image URL…"
                        className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600 text-xs" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Description</label>
                  <textarea name="description" value={form.description} onChange={handle}
                    placeholder="Product description…" rows={2}
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600 resize-none" />
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Specifications</label>
                  <textarea name="specs" value={form.specs} onChange={handle}
                    placeholder="Technical specs…" rows={2}
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600 resize-none" />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="active" checked={form.active} onChange={handle} className="sr-only" />
                    <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${form.active ? 'bg-emerald-500' : 'bg-midnight-200 dark:bg-white/10'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.active ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
                    {form.active ? 'Active — visible to customers' : 'Inactive — hidden from shop'}
                  </span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
                    {saving ? 'Saving…' : (modal === 'add' ? 'Create Product' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
