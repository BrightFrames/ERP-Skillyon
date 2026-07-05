import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  UserPlus,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  X,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "./lib/api";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    email: "",
    parent_email: "",
    class_id: "",
    gender: "Male",
    status: "Active",
    avatar: "",
    password: "",
    parent_password: "",
  });
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [metrics, setMetrics] = useState({
    male: 0,
    female: 0,
    newEnrollments: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const limit = 10;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (!isModalOpen) {
      setShowStudentPassword(false);
      setShowParentPassword(false);
    }
  }, [isModalOpen]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let queryParams = `?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`;
      if (selectedClass) queryParams += `&class_id=${selectedClass}`;
      if (selectedStatus) queryParams += `&status=${selectedStatus}`;

      const [studentsRes, classesRes] = await Promise.all([
        api.get(`/students${queryParams}`),
        api.get("/classes"),
      ]);
      setStudents(studentsRes.data.data || []);
      setTotalStudents(studentsRes.data.total || 0);
      setMetrics(
        studentsRes.data.metrics || { male: 0, female: 0, newEnrollments: 0 },
      );
      setClassesList(classesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchQuery, selectedClass, selectedStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingStudentId(null);
    setFormData({
      name: "",
      father_name: "",
      email: "",
      parent_email: "",
      class_id: "",
      gender: "Male",
      status: "Active",
      avatar: "",
      password: "",
      parent_password: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name || "",
      father_name: student.father_name || "",
      email: student.email || "",
      parent_email: student.parent_email || "",
      class_id: student.class_id || "",
      gender: student.gender || "Unknown",
      status: student.status || "Active",
      avatar: student.avatar || "",
      password: "", // Don't prefill passwords
      parent_password: "",
    });
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Remove empty passwords from payload so we don't accidentally blank them out if not updated
      const payload: any = {
        ...formData,
        class_id: formData.class_id ? parseInt(formData.class_id) : undefined,
      };

      // Remove empty strings so they don't fail Zod validation
      if (!payload.password) delete payload.password;
      if (!payload.parent_password) delete payload.parent_password;
      if (!payload.email) delete payload.email;
      if (!payload.parent_email) delete payload.parent_email;

      if (editingStudentId) {
        await api.put(`/students/${editingStudentId}`, payload);
      } else {
        await api.post("/students", payload);
      }

      setIsModalOpen(false);
      setEditingStudentId(null);
      setFormData({
        name: "",
        father_name: "",
        email: "",
        parent_email: "",
        class_id: "",
        gender: "Male",
        status: "Active",
        avatar: "",
        password: "",
        parent_password: "",
      });
      fetchStudents();
    } catch (error) {
      console.error("Failed to save student", error);
      alert("Failed to save student. Please check your inputs.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
        setActiveMenuId(null);
      } catch (error) {
        console.error("Failed to delete student", error);
        alert("Failed to delete student.");
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-6 text-foreground pb-10 min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-foreground">Student Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Student Management
          </h1>
          <p className="text-muted-foreground font-medium">
            Oversee and manage the student population records and academic
            enrollment.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Add New Student
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        {/* Total Students */}
        <div className="bg-primary p-6 rounded-2xl shadow-lg text-primary-foreground flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="text-xs font-semibold text-primary-foreground/80">
              +12% Monthly
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">{totalStudents}</p>
            <p className="text-sm font-semibold text-primary-foreground/80">
              Total Students
            </p>
          </div>
        </div>

        {/* Male Students */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            {/* Custom SVG for Male symbol */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10" cy="14" r="5"></circle>
              <line x1="13.5" y1="10.5" x2="21" y2="3"></line>
              <polyline points="16 3 21 3 21 8"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {metrics.male}
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              Male Students
            </p>
          </div>
        </div>

        {/* Female Students */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
            {/* Custom SVG for Female symbol */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="9" r="5"></circle>
              <line x1="12" y1="14" x2="12" y2="22"></line>
              <line x1="9" y1="19" x2="15" y2="19"></line>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {metrics.female}
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              Female Students
            </p>
          </div>
        </div>

        {/* New Enrollments */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {metrics.newEnrollments}
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              New Enrollments
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-card rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              Filter by:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-1.5 bg-background border border-border rounded-full text-xs font-bold text-foreground shadow-sm hover:bg-muted focus:outline-none cursor-pointer"
            >
              <option value="">All Grades</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50 focus:outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => {
                setSelectedClass("");
                setSelectedStatus("");
                setCurrentPage(0);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#3b3dbf] hover:text-[#2c2eb5] ml-2"
            >
              <Filter size={14} />
              Clear Filters
            </button>
          </div>
          <div className="text-sm font-semibold text-zinc-500">
            Showing{" "}
            <span className="font-bold text-zinc-800">
              {students.length > 0 ? currentPage * limit + 1 : 0}-
              {currentPage * limit + students.length}
            </span>{" "}
            of <span className="font-bold text-zinc-800">{totalStudents}</span>{" "}
            students
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-t-xl border-b-0">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Grade/Class</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin dark:border-slate-700 dark:border-t-indigo-500"></div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                        Loading students...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500 font-medium dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20"
                  >
                    No students found. Add a new student to get started.
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/students/${student.id}`}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={
                            student.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
                          }
                          alt={student.name}
                          className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                        />
                        <div>
                          <div className="text-slate-900 dark:text-slate-100 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {student.email || "N/A"}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {student.id >= 1000
                        ? student.id
                        : `#STU-2024-${student.id.toString().padStart(3, "0")}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold whitespace-nowrap">
                        {student.class_name || "Not Assigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {student.gender || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === "Active"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                            : student.status === "Inactive"
                              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {student.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(
                            activeMenuId === student.id ? null : student.id,
                          );
                        }}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 p-2 rounded-lg transition-colors inline-flex"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeMenuId === student.id && (
                        <div className="absolute right-10 top-10 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-10 py-2 overflow-hidden flex flex-col items-start text-sm">
                          <Link
                            to={`/students/${student.id}`}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                          >
                            <Eye size={16} /> View Profile
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(student);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                          >
                            <Edit2 size={16} /> Edit Student
                          </button>
                          <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student.id);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold transition-colors"
                          >
                            <Trash2 size={16} /> Delete Student
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* Pagination */}
        <div className="p-4 md:px-6 border border-slate-200 dark:border-slate-800 rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({
              length: Math.min(3, Math.ceil(totalStudents / limit)),
            }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === i
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {Math.ceil(totalStudents / limit) > 3 && (
              <>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                  ...
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.ceil(totalStudents / limit) - 1)
                  }
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === Math.ceil(totalStudents / limit) - 1
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {Math.ceil(totalStudents / limit)}
                </button>
              </>
            )}
          </div>

          <button
            disabled={currentPage >= Math.ceil(totalStudents / limit) - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-auto pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-zinc-500 gap-4">
        <p>© 2024 Skillyon ERP. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-800 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-zinc-800 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-zinc-900">
              {editingStudentId ? "Edit Student" : "Add New Student"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Student Name *
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. Robert Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. student@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Student Login Password{" "}
                  {editingStudentId && (
                    <span className="text-zinc-400 font-normal">
                      (Leave blank to keep unchanged)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showStudentPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                    placeholder={
                      editingStudentId ? "••••••••" : "Enter password"
                    }
                    required={!editingStudentId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showStudentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Parent Email
                </label>
                <input
                  type="email"
                  name="parent_email"
                  value={formData.parent_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. parent@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Parent Login Password{" "}
                  {editingStudentId && (
                    <span className="text-zinc-400 font-normal">
                      (Leave blank to keep unchanged)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showParentPassword ? "text" : "password"}
                    name="parent_password"
                    value={formData.parent_password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                    placeholder={
                      editingStudentId ? "••••••••" : "Enter parent password"
                    }
                    required={!editingStudentId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowParentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showParentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Class/Grade
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={(e: any) => handleInputChange(e)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                >
                  <option value="">Select a class...</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e: any) => handleInputChange(e)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e: any) => handleInputChange(e)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Avatar Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, avatar: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFormData({ ...formData, avatar: "" });
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3b3dbf] text-white rounded-lg font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm"
                >
                  {editingStudentId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
