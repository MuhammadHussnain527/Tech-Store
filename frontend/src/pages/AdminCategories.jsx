import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import { adminApi } from '../services/api';

const EMPTY = { categoryId: 0, name: '', slug: '', description: '' };

const CAT_ICONS = ['💻', '🖥️', '🖥', '⌨️', '🖱️', '💾', '🧠', '🎮', '🎧', '📷', '📺', '🔌', '🔋', '📱'];

function randomIcon() { return CAT_ICONS[Math.floor(Math.random() * CAT_ICONS.length)]; }

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [deleteId,   setDeleteId]   = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllCategories()
      .then(r => setCategories(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = ()    => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = cat   => { setForm({ ...cat }); setError(''); setModal('edit'); };
  const close    = ()    => { setModal(null); setError(''); };
  const handle   = e     => setForm(f => ({
    ...f,
    [e.target.name]: e.target.value,
    ...(e.target.name === 'name' && modal === 'add'
      ? { slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
      : {}),
  }));

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal === 'add') await adminApi.createCategory(form);
      else                 await adminApi.updateCategory(form);
      close(); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try { await adminApi.deleteCategory(deleteId); load(); } catch (err) { alert(err.message); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight-900 dark:text-white">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} product categories</p>
        </div>
        <button id="add-category-btn" onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-midnight-100 dark:bg-white/5 animate-pulse border border-midnight-200 dark:border-white/5" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-500">
          <Tag size={48} className="mb-4 opacity-30" />
          <p className="font-serif text-xl text-midnight-900 dark:text-white">No categories yet</p>
          <p className="text-sm mt-1">Add your first category to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.categoryId}
              className="group relative rounded-2xl border border-midnight-200 dark:border-white/5 p-5 hover:border-gold-500/20 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.03)', animation: `fade-in-up 0.4s ${i * 0.05}s ease-out both` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center text-lg">
                    {CAT_ICONS[cat.categoryId % CAT_ICONS.length]}
                  </div>
                  <div>
                    <p className="text-midnight-900 dark:text-white font-bold">{cat.name}</p>
                    <p className="text-slate-500 text-xs font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:bg-gold-500/10 border border-midnight-200 dark:border-white/5 hover:border-gold-500/20 transition-colors"
                  ><Pencil size={13} /></button>
                  <button
                    onClick={() => setDeleteId(cat.categoryId)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-midnight-200 dark:border-white/5 hover:border-red-500/20 transition-colors"
                  ><Trash2 size={13} /></button>
                </div>
              </div>
              {cat.description && (
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{cat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="rounded-2xl border border-midnight-200 dark:border-white/10 p-6 w-full max-w-sm shadow-2xl bg-white dark:bg-obsidian-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-midnight-900 dark:text-white font-bold">Delete Category?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">This may affect linked products.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="rounded-2xl border border-midnight-200 dark:border-white/10 w-full max-w-md shadow-2xl bg-white dark:bg-obsidian-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-midnight-200 dark:border-white/5">
              <h2 className="text-xl font-bold text-midnight-900 dark:text-white font-serif">
                {modal === 'add' ? 'Add Category' : 'Edit Category'}
              </h2>
              <button onClick={close} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:text-white hover:bg-midnight-100 dark:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Category Name *</label>
                  <input name="name" required value={form.name} onChange={handle}
                    placeholder="e.g. Laptops"
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Slug *</label>
                  <input name="slug" required value={form.slug} onChange={handle}
                    placeholder="e.g. laptops"
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600 font-mono" />
                  <p className="text-slate-600 text-xs mt-1">Auto-generated from name. Lowercase, hyphens only.</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Description</label>
                  <textarea name="description" value={form.description} onChange={handle}
                    placeholder="Optional description…" rows={3}
                    className="input bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving…' : (modal === 'add' ? 'Create Category' : 'Save Changes')}
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
