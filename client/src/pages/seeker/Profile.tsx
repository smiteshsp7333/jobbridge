import React, { useState, useRef } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiStar, FiUploadCloud, FiFileText, FiLink, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('basic');

    // State for Basic Details
    const [editBasic, setEditBasic] = useState(false);
    const [basicInfo, setBasicInfo] = useState({
        name: user?.name || 'Jane Doe',
        email: user?.email || 'jane@example.com',
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
        summary: 'Passionate software developer with a focus on modern web technologies. Constantly learning and building side projects to improve my skills.',
        photo: user?.profilePhoto || ''
    });

    // State for Education
    const [editEduId, setEditEduId] = useState<number | null>(null);
    const [educations, setEducations] = useState([
        { id: 1, institution: 'Indian Institute of Technology, Bombay', degree: 'B.Tech in Computer Science', year: '2020 - 2024', grade: '9.2 CGPA' }
    ]);
    const [newEdu, setNewEdu] = useState<any>(null);

    // State for Experience
    const [editExpId, setEditExpId] = useState<number | null>(null);
    const [experiences, setExperiences] = useState([
        { id: 1, company: 'Tech Innovators', role: 'Frontend Intern', duration: 'June 2023 - Present', description: 'Developed interactive UI components using React.js and TailwindCSS. Improved performance by 20%.' }
    ]);
    const [newExp, setNewExp] = useState<any>(null);

    // State for Skills
    const [skills, setSkills] = useState<string[]>(user?.skills || ['React.js', 'Node.js', 'TailwindCSS', 'TypeScript', 'MongoDB']);
    const [newSkill, setNewSkill] = useState('');

    // State for Projects
    const [editProjId, setEditProjId] = useState<number | null>(null);
    const [projects, setProjects] = useState([
        { id: 1, title: 'E-Commerce Platform', link: 'https://github.com/project', description: 'Full-stack platform built with Node.js and React.', tags: 'MERN, Redux' }
    ]);
    const [newProj, setNewProj] = useState<any>(null);

    // State for Resumes
    const [resumes, setResumes] = useState([{ id: 1, name: 'My_Resume_Final_2026.pdf', date: 'Oct 15, 2026' }]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sections = [
        { id: 'basic', label: 'Basic Details' },
        { id: 'education', label: 'Education Details' },
        { id: 'experience', label: 'Experience' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'resume', label: 'Resume & Documents' }
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Skills logic
    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSkill.trim() && !skills.includes(newSkill.trim())) {
            e.preventDefault();
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    // Calculate dynamic completeness based on filled data
    const calculateCompleteness = () => {
        let score = 0;
        if (basicInfo.name && basicInfo.summary) score += 20;
        if (educations.length > 0) score += 20;
        if (experiences.length > 0) score += 20;
        if (skills.length >= 3) score += 20;
        if (projects.length > 0) score += 10;
        if (resumes.length > 0) score += 10;
        return score;
    };

    const completeness = calculateCompleteness();

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex flex-col">
                    <span className="font-bold">Profile Completeness</span>
                    <span className="text-xs text-[#a0a0a0]">Complete your profile to stand out to employers.</span>
                </div>
                <div className="w-1/2 lg:w-1/3 flex items-center gap-4">
                    <div className="w-full bg-[#111111] rounded-full h-2 flex-1">
                        <div className="bg-[#c5f135] h-2 rounded-full transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
                    </div>
                    <span className="text-[#c5f135] font-bold">{completeness}%</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
                <div className="w-full md:w-[220px] flex flex-col gap-2 flex-shrink-0 overflow-y-auto scrollbar-hide select-none pt-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                activeSection === section.id 
                                ? 'bg-[#c5f135] text-[#0f0f0f] shadow-[0_0_15px_rgba(197,241,53,0.3)]' 
                                : 'text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white border border-transparent'
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-8 scrollbar-thin">
                    
                    {/* Basic details section */}
                    <div id="basic" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Basic Details</h3>
                            {!editBasic && (
                                <button onClick={() => setEditBasic(true)} className="flex items-center gap-2 text-sm text-[#c5f135] hover:bg-[#c5f135]/10 px-3 py-1.5 rounded transition-all font-medium">
                                    <FiEdit2 size={14} /> Edit Info
                                </button>
                            )}
                        </div>
                        <AnimatePresence mode="wait">
                            {editBasic ? (
                                <motion.div key="edit" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 flex items-center gap-4 mb-2">
                                        <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-2xl font-bold text-[#c5f135] flex-shrink-0 uppercase overflow-hidden relative group">
                                            {basicInfo.photo ? <img src={basicInfo.photo} alt="Profile" className="w-full h-full object-cover" /> : (basicInfo.name?.[0] || 'U')}
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white" title="Upload Photo">
                                                <FiUploadCloud size={20} />
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                    if(e.target.files && e.target.files[0]) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => setBasicInfo({...basicInfo, photo: ev.target?.result as string});
                                                        reader.readAsDataURL(e.target.files[0]);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Profile Photo</p>
                                            <p className="text-xs text-[#a0a0a0]">Hover over the avatar to upload a new profile picture</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#a0a0a0] mb-1">Full Name</label>
                                        <input type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5f135] transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#a0a0a0] mb-1">Email Address (Cannot change)</label>
                                        <input type="text" value={basicInfo.email} disabled className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#555] cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#a0a0a0] mb-1">Phone Number</label>
                                        <input type="text" value={basicInfo.phone} onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})} className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5f135] transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#a0a0a0] mb-1">Location</label>
                                        <input type="text" value={basicInfo.location} onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})} className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5f135] transition-colors" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-[#a0a0a0] mb-1">Summary / Bio</label>
                                        <textarea rows={4} value={basicInfo.summary} onChange={(e) => setBasicInfo({...basicInfo, summary: e.target.value})} className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5f135] resize-none transition-colors"></textarea>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <button onClick={() => setEditBasic(false)} className="px-5 py-2 rounded-lg text-sm text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors">Cancel</button>
                                        <button onClick={() => setEditBasic(false)} className="px-6 py-2 bg-[#c5f135] text-[#0f0f0f] rounded-lg text-sm font-bold hover:bg-[#d4ff3a] shadow-[0_0_10px_rgba(197,241,53,0.2)]">Save Changes</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-6">
                                    <div className="w-24 h-24 rounded-full bg-[#111111] border-2 border-[#c5f135]/50 shadow-[0_0_15px_rgba(197,241,53,0.1)] flex items-center justify-center text-4xl font-bold text-[#c5f135] flex-shrink-0 uppercase overflow-hidden">
                                        {basicInfo.photo ? <img src={basicInfo.photo} alt="Profile" className="w-full h-full object-cover" /> : (basicInfo.name?.[0] || 'U')}
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <h4 className="font-bold text-xl">{basicInfo.name}</h4>
                                            <p className="text-sm text-[#a0a0a0]">{basicInfo.email}</p>
                                        </div>
                                        <p className="text-sm text-[#d0d0d0] leading-relaxed whitespace-pre-wrap">
                                            {basicInfo.summary || 'No summary written yet.'}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-4 border-t border-[#2a2a2a] pt-4 text-sm">
                                            <div><span className="text-[#a0a0a0] mr-2">Phone:</span> <span className="font-medium">{basicInfo.phone}</span></div>
                                            <div><span className="text-[#a0a0a0] mr-2">Location:</span> <span className="font-medium">{basicInfo.location}</span></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Education Section */}
                    <div id="education" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Education Details</h3>
                        </div>
                        <div className="space-y-4">
                            {educations.map(edu => (
                                <div key={edu.id} className="border border-[#2a2a2a] bg-[#111111] rounded-xl p-5 hover:border-[#c5f135]/40 transition-colors">
                                    {editEduId === edu.id ? (
                                        <div className="space-y-3">
                                            <input type="text" value={edu.institution} onChange={(e) => setEducations(educations.map(ed => ed.id === edu.id ? {...ed, institution: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <input type="text" value={edu.degree} onChange={(e) => setEducations(educations.map(ed => ed.id === edu.id ? {...ed, degree: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#c5f135]" />
                                                <input type="text" value={edu.year} onChange={(e) => setEducations(educations.map(ed => ed.id === edu.id ? {...ed, year: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0]" />
                                                <input type="text" value={edu.grade} onChange={(e) => setEducations(educations.map(ed => ed.id === edu.id ? {...ed, grade: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0]" />
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setEditEduId(null)} className="px-4 py-1.5 bg-[#c5f135] text-[#0f0f0f] rounded text-xs font-bold hover:bg-[#d4ff3a]">Done</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-white text-lg">{edu.institution}</h4>
                                                <div className="flex gap-3">
                                                    <button onClick={() => setEditEduId(edu.id)} className="text-[#a0a0a0] hover:text-[#c5f135] transition-colors"><FiEdit2 size={16}/></button>
                                                    <button onClick={() => setEducations(educations.filter(e => e.id !== edu.id))} className="text-[#a0a0a0] hover:text-[#ff4d4d] transition-colors"><FiTrash2 size={16}/></button>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-[#c5f135]">{edu.degree}</p>
                                            <div className="flex justify-between mt-4 text-sm text-[#a0a0a0] font-medium border-t border-[#2a2a2a] pt-3">
                                                <span>{edu.year}</span>
                                                <span>Grade: <span className="text-white">{edu.grade}</span></span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {newEdu ? (
                                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="border border-[#c5f135]/50 bg-[#111111] rounded-xl p-5 space-y-3">
                                    <input type="text" placeholder="Institution Name" value={newEdu.institution} onChange={(e) => setNewEdu({...newEdu, institution: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <input type="text" placeholder="Degree (e.g. B.Sc, M.A.)" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                        <input type="text" placeholder="Timeline (e.g. 2020-2024)" value={newEdu.year} onChange={(e) => setNewEdu({...newEdu, year: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                        <input type="text" placeholder="Grade/CGPA" value={newEdu.grade} onChange={(e) => setNewEdu({...newEdu, grade: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-3">
                                        <button onClick={() => setNewEdu(null)} className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white">Cancel</button>
                                        <button onClick={() => { setEducations([...educations, { ...newEdu, id: Date.now() }]); setNewEdu(null); }} className="px-5 py-2 bg-[#c5f135] text-[#0f0f0f] rounded-lg text-sm font-bold hover:bg-[#d4ff3a]">Save</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button onClick={() => setNewEdu({ institution: '', degree: '', year: '', grade: '' })} className="w-full py-4 border-2 border-dashed border-[#2a2a2a] rounded-xl text-[#a0a0a0] flex items-center justify-center gap-2 hover:bg-[#111111] hover:border-[#c5f135]/50 hover:text-[#c5f135] transition-all text-sm font-bold">
                                    <FiPlus size={18} /> Add New Education
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div id="experience" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Work Experience</h3>
                        </div>
                        <div className="space-y-4">
                            {experiences.map(exp => (
                                <div key={exp.id} className="border border-[#2a2a2a] bg-[#111111] rounded-xl p-5 hover:border-[#c5f135]/40 transition-colors">
                                    {editExpId === exp.id ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input type="text" value={exp.role} onChange={(e) => setExperiences(experiences.map(ed => ed.id === exp.id ? {...ed, role: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                                <input type="text" value={exp.company} onChange={(e) => setExperiences(experiences.map(ed => ed.id === exp.id ? {...ed, company: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#c5f135]" />
                                            </div>
                                            <input type="text" value={exp.duration} onChange={(e) => setExperiences(experiences.map(ed => ed.id === exp.id ? {...ed, duration: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0]" />
                                            <textarea rows={3} value={exp.description} onChange={(e) => setExperiences(experiences.map(ed => ed.id === exp.id ? {...ed, description: e.target.value} : ed))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0] resize-none" />
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setEditExpId(null)} className="px-4 py-1.5 bg-[#c5f135] text-[#0f0f0f] rounded text-xs font-bold hover:bg-[#d4ff3a]">Done</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{exp.role}</h4>
                                                    <p className="text-sm font-medium text-[#c5f135]">{exp.company}</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => setEditExpId(exp.id)} className="text-[#a0a0a0] hover:text-[#c5f135] transition-colors"><FiEdit2 size={16}/></button>
                                                    <button onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))} className="text-[#a0a0a0] hover:text-[#ff4d4d] transition-colors"><FiTrash2 size={16}/></button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#a0a0a0] font-medium mb-3">{exp.duration}</p>
                                            <p className="text-sm text-[#d0d0d0] leading-relaxed bg-[#0f0f0f] p-4 rounded-lg border border-[#2a2a2a]">{exp.description}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                            {newExp ? (
                                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="border border-[#c5f135]/50 bg-[#111111] rounded-xl p-5 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" placeholder="Designation / Role" value={newExp.role} onChange={(e) => setNewExp({...newExp, role: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                        <input type="text" placeholder="Company Name" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                    </div>
                                    <input type="text" placeholder="Duration (e.g. Jan 2021 - Dec 2023 or Present)" value={newExp.duration} onChange={(e) => setNewExp({...newExp, duration: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                    <textarea rows={3} placeholder="Job Description & Responsibilities..." value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white resize-none" />
                                    <div className="flex justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
                                        <button onClick={() => setNewExp(null)} className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white">Cancel</button>
                                        <button onClick={() => { setExperiences([...experiences, { ...newExp, id: Date.now() }]); setNewExp(null); }} className="px-5 py-2 bg-[#c5f135] text-[#0f0f0f] rounded-lg text-sm font-bold hover:bg-[#d4ff3a]">Save Experience</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button onClick={() => setNewExp({ role: '', company: '', duration: '', description: '' })} className="w-full py-4 border-2 border-dashed border-[#2a2a2a] rounded-xl text-[#a0a0a0] flex items-center justify-center gap-2 hover:bg-[#111111] hover:border-[#c5f135]/50 hover:text-[#c5f135] transition-all text-sm font-bold">
                                    <FiPlus size={18} /> Add Professional Experience
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div id="skills" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Skills & Expertise</h3>
                        </div>
                        <div className="mb-6 relative">
                            <input 
                                type="text" 
                                value={newSkill} 
                                onChange={(e) => setNewSkill(e.target.value)} 
                                onKeyDown={handleAddSkill}
                                placeholder="Type a skill and press Enter to add..." 
                                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c5f135] transition-colors shadow-inner"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#a0a0a0]">Press Enter <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded ml-1">↵</span></span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <AnimatePresence>
                                {skills.map((skill, index) => (
                                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} key={skill + index} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#c5f135] text-white px-3.5 py-1.5 rounded-full text-sm shadow-[0_0_10px_rgba(197,241,53,0.1)] group">
                                        <span className="font-medium">{skill}</span>
                                        <button onClick={() => removeSkill(skill)} className="text-[#a0a0a0] hover:text-[#ff4d4d] group-hover:opacity-100 opacity-50 focus:outline-none transition-all"><FiX size={14}/></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {skills.length === 0 && <p className="text-sm text-[#a0a0a0] mx-auto py-4">No skills added yet.</p>}
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div id="projects" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Highlighted Projects</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {projects.map(proj => (
                                <div key={proj.id} className="border border-[#2a2a2a] bg-[#111111] rounded-xl p-5 flex flex-col hover:border-[#c5f135]/50 transition-colors group relative">
                                    {editProjId === proj.id ? (
                                        <div className="space-y-3 z-10 relative">
                                            <input type="text" value={proj.title} onChange={(e) => setProjects(projects.map(p => p.id === proj.id ? {...p, title: e.target.value} : p))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                            <input type="text" value={proj.link} onChange={(e) => setProjects(projects.map(p => p.id === proj.id ? {...p, link: e.target.value} : p))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#c5f135]" />
                                            <textarea rows={2} value={proj.description} onChange={(e) => setProjects(projects.map(p => p.id === proj.id ? {...p, description: e.target.value} : p))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0] resize-none" />
                                            <input type="text" placeholder="Tags comma separated" value={proj.tags} onChange={(e) => setProjects(projects.map(p => p.id === proj.id ? {...p, tags: e.target.value} : p))} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-1.5 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                            
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setEditProjId(null)} className="px-4 py-1.5 bg-[#c5f135] text-[#0f0f0f] rounded text-xs font-bold hover:bg-[#d4ff3a]">Done</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditProjId(proj.id)} className="bg-[#1a1a1a] p-1.5 rounded text-[#a0a0a0] hover:text-[#c5f135]"><FiEdit2 size={14}/></button>
                                                <button onClick={() => setProjects(projects.filter(p => p.id !== proj.id))} className="bg-[#1a1a1a] p-1.5 rounded text-[#a0a0a0] hover:text-[#ff4d4d]"><FiTrash2 size={14}/></button>
                                            </div>
                                            <h4 className="font-bold text-lg text-white mb-1 pr-16">{proj.title}</h4>
                                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-[#c5f135] flex items-center gap-1 hover:underline mb-3 w-fit"><FiLink size={12}/> {proj.link}</a>}
                                            <p className="text-sm text-[#a0a0a0] flex-1 mb-4 leading-relaxed">{proj.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[#2a2a2a]">
                                                {proj.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="text-[10px] uppercase font-bold bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded text-[#d0d0d0] tracking-wider">{tag.trim()}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {newProj ? (
                                <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="border border-[#c5f135]/50 bg-[#111111] rounded-xl p-5 space-y-3 flex flex-col col-span-1 lg:col-span-2 xl:col-span-1">
                                    <input type="text" placeholder="Project Title" value={newProj.title} onChange={(e) => setNewProj({...newProj, title: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm font-bold text-white" />
                                    <input type="text" placeholder="Direct Link / GitHub URL" value={newProj.link} onChange={(e) => setNewProj({...newProj, link: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-[#c5f135]" />
                                    <textarea rows={3} placeholder="Project description and your role..." value={newProj.description} onChange={(e) => setNewProj({...newProj, description: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-[#a0a0a0] resize-none" />
                                    <input type="text" placeholder="Tags (e.g. React, MongoDB, Auth)" value={newProj.tags} onChange={(e) => setNewProj({...newProj, tags: e.target.value})} className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:border-[#c5f135] focus:outline-none text-sm text-white" />
                                    <div className="flex justify-end gap-3 pt-3 flex-1 mt-auto border-t border-[#2a2a2a]">
                                        <button onClick={() => setNewProj(null)} className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white">Cancel</button>
                                        <button onClick={() => { setProjects([...projects, { ...newProj, id: Date.now() }]); setNewProj(null); }} className="px-5 py-2 bg-[#c5f135] text-[#0f0f0f] rounded-lg text-sm font-bold hover:bg-[#d4ff3a]">Add Project</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button onClick={() => setNewProj({ title: '', link: '', description: '', tags: '' })} className="w-full h-full min-h-[220px] border-2 border-dashed border-[#2a2a2a] rounded-xl text-[#a0a0a0] flex flex-col items-center justify-center gap-3 hover:bg-[#111111] hover:border-[#c5f135]/50 hover:text-[#c5f135] transition-all text-sm font-bold">
                                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-inherit mb-1 transition-colors border border-[#2a2a2a]"><FiPlus size={24} /></div>
                                    Add New Project
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Resume & Documents Section */}
                    <div id="resume" className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm mb-20">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
                            <h3 className="text-xl font-bold text-white">Resume & Documents</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <AnimatePresence>
                                {resumes.map((res) => (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={res.id} className="border border-[#c5f135] bg-[#c5f135]/5 rounded-xl p-4 relative flex items-center gap-4 group">
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#c5f135] rounded-full flex items-center justify-center text-[#0f0f0f] shadow-lg">
                                            <FiStar size={12} className="fill-current" />
                                        </div>
                                        <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center text-[#c5f135] border border-[#c5f135]/30 flex-shrink-0">
                                            <FiFileText size={24} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-sm truncate text-white" title={res.name}>{res.name}</h4>
                                            <p className="text-xs text-[#a0a0a0] mt-0.5">Uploaded {res.date}</p>
                                        </div>
                                        <button onClick={() => setResumes(resumes.filter(r => r.id !== res.id))} className="text-[#a0a0a0] hover:text-[#ff4d4d] ml-auto p-2 opacity-0 group-hover:opacity-100 transition-all bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                            <FiTrash2 size={16}/>
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    setIsUploading(true);
                                    setTimeout(() => {
                                        setResumes([...resumes.map(r => ({...r, id: r.id + 1})), { id: Date.now(), name: file.name, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }]);
                                        setIsUploading(false);
                                    }, 1500);
                                }
                            }}
                        />
                        <button 
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()} 
                            className={`w-full py-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-sm font-medium ${isUploading ? 'border-[#c5f135] bg-[#c5f135]/10 text-white cursor-wait' : 'border-[#2a2a2a] text-[#a0a0a0] hover:bg-[#111111] hover:border-[#c5f135]/50 hover:text-[#c5f135]'}`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-10 h-10 border-4 border-[#c5f135]/30 border-t-[#c5f135] rounded-full animate-spin"></div>
                                    <span className="font-bold text-[#c5f135]">Analyzing and Uploading Document...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-[#111111] rounded-full flex items-center justify-center text-inherit mb-1 border border-[#2a2a2a]"><FiUploadCloud size={28} /></div>
                                    <span className="font-bold text-base">Click to browse or drag & drop resume</span>
                                    <span className="text-xs opacity-60 font-normal mt-1">Supported formats: PDF, DOC, DOCX (Max 5MB)</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;