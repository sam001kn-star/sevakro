import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search } from 'lucide-react';
import DoctorCard from '@/components/doctors/DoctorCard';

export default function Doctors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('all');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.filter({ is_active: true }),
    initialData: [],
  });

  const filtered = doctors.filter(d => {
    const matchSearch = !search || d.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialization === 'all' || d.specialization === specialization;
    return matchSearch && matchSpec;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-nav">
      <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Find a Doctor</h1>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        {specializations.length > 0 && (
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">
            No doctors found
          </div>
        ) : (
          filtered.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={(d) => navigate(`/book-doctor/${d.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}