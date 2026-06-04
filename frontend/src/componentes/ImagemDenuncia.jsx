import { useState, useEffect } from 'react';
import cliente from '../api/cliente';

const ImagemDenuncia = ({ url, alt = 'Anexo', className = '' }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const carregarImagem = async () => {
      try {
        setLoading(true);
        setErro(false);
        const response = await cliente.get(url, { responseType: 'blob' });
        
        if (active) {
          objectUrl = URL.createObjectURL(response.data);
          setSrc(objectUrl);
        }
      } catch {
        if (active) {
          setErro(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (url) {
      carregarImagem();
    }

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center animate-pulse rounded-lg ${className}`}>
        <span className="text-xs text-gray-400 font-semibold">Carregando imagem...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={`bg-gray-150 flex items-center justify-center border border-gray-300 rounded-lg text-center p-4 ${className}`}>
        <span className="text-xs text-red-500 font-medium">⚠️ Falha ao carregar imagem</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`rounded-lg object-cover shadow-xs border border-gray-200 ${className}`} 
    />
  );
};

export default ImagemDenuncia;
