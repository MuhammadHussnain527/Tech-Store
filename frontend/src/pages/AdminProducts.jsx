import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { adminApi, resolveImageUrl } from '../services/api';

const EMPTY = { productId: 0, categoryId: '', name: '', brand: '', price: '', stockQty: '', description: '', specs: '', imageUrl: '', active: true };

export default function AdminProducts() {
  const [products,  setProducts]  = useState([]);
  const [categories,setCategories]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminApi.getAllProducts(), adminApi.getAllCategories()]);
      setProducts(p.data ?? []);
      setCategories(c.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd  = ()      => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (prod)  => { setForm({ ...prod }); setError(''); setModal('edit'); };
  const close    = ()      => { setModal(null); setError(''); };
  const handle   = e       => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

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
      const payload = { ...form, price: Number(form.price), stockQty: Number(form.stockQty), categoryId: Number(form.categoryId) };
      if (modal === 'add') await adminApi.createProduct(payload);
      else                 await adminApi.updateProduct(payload);
      close(); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try { await adminApi.deleteProduct(id); load(); } catch (err) { alert(err.message); }
  };

  const previewUrl = form.imageUrl ? resolveImageUrl(form.imageUrl) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Products</h1><p className="text-slate-400 text-sm mt-1">{products.length} total</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length: 6}).map((_, i) => <div key={i} className="card h-14 animate-pulse bg-surface-800" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                {['Image','Name','Brand','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map(p => (
                <tr key={p.productId} className="hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {p.imageUrl
                      ? <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      : <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center text-lg">📦</div>
                    }
                  </td>
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{p.name}</td>
                  <td className="px-4 py-3 text-slate-400">{p.brand || '—'}</td>
                  <td className="px-4 py-3 text-white font-semibold">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{p.stockQty}</td>
                  <td className="px-4 py-3">{p.active ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => del(p.productId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 animate-fade-in">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={close} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">{error}</div>}
            <form onSubmit={save} className="space-y-3">
              <select name="categoryId" value={form.categoryId} onChange={handle} required className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>
              {[
                {name:'name',       label:'Product name', type:'text'},
                {name:'brand',      label:'Brand',        type:'text'},
                {name:'price',      label:'Price',        type:'number'},
                {name:'stockQty',   label:'Stock qty',    type:'number'},
              ].map(({name, label, type}) => (
                <input key={name} name={name} type={type} value={form[name]} onChange={handle}
                  placeholder={label} className="input"
                  required={name==='name'||name==='price'||name==='stockQty'} step={name==='price'?'0.01':undefined} min={0} />
              ))}

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Product Image</label>
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-slate-700" />
                )}
                <label className="btn-secondary py-2 px-4 text-sm cursor-pointer inline-flex items-center gap-2">
                  <Upload size={14} />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <input name="imageUrl" type="url" value={form.imageUrl} onChange={handle}
                  placeholder="Or paste image URL" className="input" />
              </div>

              <textarea name="description" value={form.description} onChange={handle} placeholder="Description" rows={3} className="input resize-none" />
              <textarea name="specs"       value={form.specs}       onChange={handle} placeholder="Specs"       rows={3} className="input resize-none" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active} onChange={handle} className="accent-brand-500 w-4 h-4" />
                <span className="text-sm text-slate-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
