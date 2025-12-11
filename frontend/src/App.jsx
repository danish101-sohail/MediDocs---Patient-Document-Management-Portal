import { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import Alert from './components/Alert';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data.documents);
    } catch (error) {
      showAlert('Failed to fetch documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showAlert('Document uploaded successfully!', 'success');
      fetchDocuments();
    } catch (error) {
      showAlert(error.response?.data?.error || 'Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showAlert('Document downloaded successfully!', 'success');
    } catch (error) {
      showAlert('Failed to download document', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/documents/${id}`);
      showAlert('Document deleted successfully!', 'success');
      fetchDocuments();
    } catch (error) {
      showAlert('Failed to delete document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
             MediDocs
          </h1>
          <p className="text-gray-600">
            Secure Patient Document Management Portal
          </p>
        </div>

        {/* Alert */}
        {alert && <Alert message={alert.message} type={alert.type} />}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <DocumentUpload onUpload={handleUpload} loading={loading} />
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DocumentList
            documents={documents}
            loading={loading}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;