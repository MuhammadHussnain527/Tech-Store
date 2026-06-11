import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '../services/api';

const EMPTY = { categoryId: 0, name: '', slug: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getAllCategories().then(r => setCategories(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = ()    => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (cat) => { setForm({ ...cat }); setError(''); setModal('edit'); };
  const close    = ()    => { setModal(null); setError(''); };
  const handle   = e     => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal === 'add') await adminApi.createCategory(form);
      else                 await adminApi.updateCategory(form);
      close(); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete category?')) return;
    try { await adminApi.deleteCategory(id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Categories</h1><p className="text-slate-400 text-sm mt-1">{categories.length} total</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Category</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="card h-14 animate-pulse bg-surface-800"/>)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                {['Name','Slug','Description','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {categories.map(cat => (
                <tr key={cat.categoryId} className="hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3 text-white font-semibold">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-colors"><Pencil size={14}/></button>
                      <button onClick={()=>del(cat.categoryId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 animate-fade-in">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">{modal==='add'?'Add Category':'Edit Category'}</h2>
              <button onClick={close} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">{error}</div>}
            <form onSubmit={save} className="space-y-3">
              <input name="name" required value={form.name} onChange={handle} placeholder="Category name" className="input" />
              <input name="slug" required value={form.slug} onChange={handle} placeholder="slug-here" className="input" />
              <textarea name="description" value={form.description} onChange={handle} placeholder="Description (optional)" rows={3} className="input resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving?'Saving…':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
