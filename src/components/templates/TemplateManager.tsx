import React, { useState, useEffect } from 'react';
import { Template } from '../../types';
import { CheckCircle, Edit, Trash, Save, X, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TEMPLATES: Template[] = [
  { id: 1, name: 'Welcome Email', subject: 'Welcome to the Team!', body: '<h1>Hi {{name}},</h1><p>Welcome aboard! We are excited to have you.</p>' },
  { id: 2, name: 'Promotional Offer', subject: 'A Special Offer Just For You', body: '<h1>Hi {{name}},</h1><p>Get 20% off your next purchase with code: <strong>PROMO20</strong></p>' },
  { id: 3, name: 'Blank Template', subject: '', body: '' },
];

interface TemplateManagerProps {
  onSelect: (template: Template | null) => void;
  selectedTemplateId: number | null;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelect, selectedTemplateId }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('emailTemplates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ subject: string; body: string }>({ subject: '', body: '' });

  useEffect(() => {
    localStorage.setItem('emailTemplates', JSON.stringify(templates));
  }, [templates]);

  const handleSelect = (template: Template) => {
    if (selectedTemplateId === template.id) {
      onSelect(null); // Deselect if clicked again
    } else {
      onSelect(template);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setEditForm({ subject: template.subject, body: template.body });
    onSelect(template); // Also select the template being edited for preview
  };
  
  const handleSave = () => {
    if (!editingId) return;

    const updatedTemplates = templates.map(t =>
      t.id === editingId ? { ...t, subject: editForm.subject, body: editForm.body } : t
    );
    setTemplates(updatedTemplates);

    const updatedTemplate = updatedTemplates.find(t => t.id === editingId);
    if (updatedTemplate) onSelect(updatedTemplate);
    
    setEditingId(null);
    toast.success('Template saved successfully!');
  };

  const handleReset = (templateId: number) => {
    if (window.confirm('Are you sure you want to clear this template? This cannot be undone.')) {
      const updatedTemplates = templates.map(t =>
        t.id === templateId ? { ...t, subject: '', body: '' } : t
      );
      setTemplates(updatedTemplates);
      if (selectedTemplateId === templateId) onSelect(updatedTemplates.find(t => t.id === templateId) || null);
      toast.success('Template has been cleared.');
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Select a template to use for your email campaign.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <div key={template.id} className={`relative border rounded-lg p-4 transition-all cursor-pointer ${selectedTemplateId === template.id ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'}`} onClick={() => handleSelect(template)}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{template.name}</h3>
              <div className="flex space-x-2">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(template); }} className="text-gray-400 hover:text-indigo-600" title="Edit"><Edit size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleReset(template.id); }} className="text-gray-400 hover:text-red-600" title="Reset"><Trash size={16} /></button>
              </div>
            </div>
            {template.subject || template.body ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="truncate"><strong>Subject:</strong> {template.subject}</p>
                <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: template.body.replace(/<[^>]+>/g, ' ') }}></p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Empty template</p>
            )}
            {selectedTemplateId === template.id && <CheckCircle size={20} className="absolute top-3 right-3 text-indigo-600 bg-white rounded-full" />}
          </div>
        ))}
      </div>

      {editingId && (
        <div className="mt-6 border border-gray-300 rounded-lg p-6 bg-white shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Editing: {templates.find(t => t.id === editingId)?.name}</h3>
            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" id="template-subject" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="template-body" className="block text-sm font-medium text-gray-700 mb-1">Body (HTML supported)</label>
              <textarea id="template-body" rows={8} value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleSave} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Save size={16} className="mr-2" /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;