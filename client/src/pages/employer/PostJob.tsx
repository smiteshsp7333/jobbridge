import React from 'react';
import PostJobModal from '../../components/PostJobModal';
import { useState } from 'react';

const PostJob: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-bold mb-4 text-white">Post a New Job</h2>
      <p className="text-[#a0a0a0] mb-8">Fill out the details below to create a new job listing.</p>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-[#c5f135] text-[#0f0f0f] font-bold px-8 py-3 rounded-lg hover:bg-[#d4ff3a] transition-all mb-8"
      >
        + Post Job
      </button>
      <PostJobModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onJobPosted={() => setModalOpen(false)} />
    </div>
  );
};

export default PostJob;
