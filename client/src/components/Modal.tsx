import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#181818] rounded-2xl shadow-2xl relative w-full max-w-2xl mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#c5f135] text-2xl font-bold z-10"
          aria-label="Close Modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
