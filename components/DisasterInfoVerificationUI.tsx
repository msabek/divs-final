'use client';

import React, { useState, useCallback, FormEvent, ChangeEvent, useRef } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Map, BarChart2, X, ThumbsUp, ThumbsDown, Plus, Upload } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const DynamicIncidentMap = dynamic(() => import('./IncidentMap'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

interface IncidentCategory {
  value: string;
  label: string;
}

interface InfoItem {
  id: number;
  text: string;
  upvotes: number;
  downvotes: number;
}

interface Incident {
  id: number;
  lat: number;
  lng: number;
  description: string;
  category: string;
}

const incidentCategories: IncidentCategory[] = [
  { value: 'flooding', label: 'Flooding' },
  { value: 'fire', label: 'Fire' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'storm', label: 'Severe Storm' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'infrastructure', label: 'Infrastructure Damage' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'other', label: 'Other' }
];

interface NewsItemProps {
  info: InfoItem;
  onVerify?: (id: number) => void;
  isPending: boolean;
  onVote?: (id: number, voteType: 'up' | 'down') => void;
}

const NewsItem: React.FC<NewsItemProps> = ({ info, onVerify, isPending, onVote }) => {
  return (
    <li className="flex items-center justify-between mb-2">
      <span className="mr-2">{info.text}</span>
      {isPending && onVote && (
        <div className="flex items-center">
          <button onClick={() => onVote(info.id, 'up')} className="mr-1 px-2 py-1 border rounded">
            <ThumbsUp size={16} />
            <span className="ml-1">{info.upvotes}</span>
          </button>
          <button onClick={() => onVote(info.id, 'down')} className="mr-1 px-2 py-1 border rounded">
            <ThumbsDown size={16} />
            <span className="ml-1">{info.downvotes}</span>
          </button>
          {onVerify && (
            <button onClick={() => onVerify(info.id)} className="px-2 py-1 bg-blue-500 text-white rounded">Verify</button>
          )}
        </div>
      )}
    </li>
  );
};

interface IncidentReportFormProps {
  onSubmit: (incident: { description: string; category: string; media: File | null; lat: number; lng: number }) => void;
  onCancel: () => void;
  lat: number;
  lng: number;
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ onSubmit, onCancel, lat, lng }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (description && category) {
      onSubmit({ description, category, media, lat, lng });
    } else {
      alert('Please provide a description and select a category.');
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={category}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
        required
        className="w-full p-2 border rounded"
      >
        <option value="">Select incident category</option>
        {incidentCategories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Describe the incident..."
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setMedia(e.target.files ? e.target.files[0] : null)}
          className="border rounded p-1"
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={handleFileButtonClick} className="px-2 py-1 bg-gray-200 rounded">
          <Upload size={20} className="mr-2" />
          Upload Media
        </button>
      </div>
      {media && <p>File selected: {media.name}</p>}
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit Report</button>
      </div>
    </form>
  );
};
const DisasterInfoVerificationUI: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [verifiedInfo, setVerifiedInfo] = useState<InfoItem[]>([
    { id: 1, text: 'Emergency shelters open at City Hall', upvotes: 0, downvotes: 0 },
    { id: 2, text: 'Highway 16 closed due to flooding', upvotes: 0, downvotes: 0 }
  ]);
  const [pendingInfo, setPendingInfo] = useState<InfoItem[]>([
    { id: 3, text: 'Reports of power outages in downtown area', upvotes: 0, downvotes: 0 },
    { id: 4, text: 'Unconfirmed sightings of structural damage', upvotes: 0, downvotes: 0 }
  ]);
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: 1, lat: 52.1332, lng: -106.6700, description: 'Flooding near Athabasca River', category: 'flooding' },
    { id: 2, lat: 52.1432, lng: -106.6800, description: 'Wildfire spotted in Jasper National Park', category: 'fire' }
  ]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [tempIncidentLocation, setTempIncidentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearch = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
    // Implement actual search logic here
  }, [searchTerm]);

  const handleAddFilter = useCallback(() => {
    const newFilter = prompt('Enter a new filter:');
    if (newFilter) setActiveFilters(prev => [...prev, newFilter]);
  }, []);

  const handleRemoveFilter = useCallback((filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  }, []);

  const handleVerifyInfo = useCallback((id: number) => {
    setPendingInfo(prev => {
      const infoToVerify = prev.find(info => info.id === id);
      if (infoToVerify) {
        setVerifiedInfo(prevVerified => [...prevVerified, infoToVerify]);
      }
      return prev.filter(info => info.id !== id);
    });
  }, []);

  const handleVote = useCallback((id: number, voteType: 'up' | 'down', isPending: boolean) => {
    const updateVotes = (infoArray: InfoItem[]) => 
      infoArray.map(info => 
        info.id === id 
          ? { ...info, [voteType === 'up' ? 'upvotes' : 'downvotes']: info[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1 }
          : info
      );

    if (isPending) {
      setPendingInfo(prev => updateVotes(prev));
    } else {
      setVerifiedInfo(prev => updateVotes(prev));
    }
  }, []);

  const handleAddIncident = (lat: number, lng: number) => {
    setShowReportForm(true);
    setTempIncidentLocation({ lat, lng });
  };

  const handleSubmitIncident = (newIncident: { description: string; category: string; media: File | null; lat: number; lng: number }) => {
    setIncidents(prev => [
      ...prev,
      {
        id: prev.length + 1,
        lat: newIncident.lat,
        lng: newIncident.lng,
        description: newIncident.description,
        category: newIncident.category
      }
    ]);
    setShowReportForm(false);
    setTempIncidentLocation(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Disaster Information Verification System</h1>
        <div className="flex items-center space-x-4">
          <Image src="/api/placeholder/100/50" alt="Alberta Logo" width={100} height={50} className="h-10" />
          <Image src="/api/placeholder/100/50" alt="University of Alberta Logo" width={100} height={50} className="h-10" />
          <button onClick={() => setShowReportForm(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">
            <Plus size={20} className="mr-2" />
            Report Incident
          </button>
        </div>
      </header>
      
      <form onSubmit={handleSearch} className="flex mb-4">
        <div className="flex-grow mr-2 relative">
          <input
            type="text"
            placeholder="Search for disaster-related information..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Search</button>
        <button type="button" onClick={handleAddFilter} className="ml-2 px-4 py-2 bg-gray-200 rounded">
          <Filter size={20} className="mr-2" />
          Add Filter
        </button>
      </form>
      
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 rounded">
              {filter}
              <X size={14} className="ml-2 cursor-pointer" onClick={() => handleRemoveFilter(filter)} />
            </span>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            Critical Alerts
          </h2>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <h3 className="font-bold">Evacuation Order</h3>
            <p>Immediate evacuation required for Jasper and surrounding areas.</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <CheckCircle className="mr-2 text-green-500" />
            Verified Information
          </h2>
          <ul className="list-none pl-0">
            {verifiedInfo.map((info) => (
              <NewsItem
                key={info.id}
                info={info}
                isPending={false}
              />
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Clock className="mr-2 text-yellow-500" />
            Pending Verification
          </h2>
          <ul className="list-none pl-0">
            {pendingInfo.map((info) => (
              <NewsItem
                key={info.id}
                info={info}
                onVerify={handleVerifyInfo}
                onVote={(id, voteType) => handleVote(id, voteType, true)}
                isPending={true}
              />
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Map className="mr-2 text-blue-500" />
          Incident Map
        </h2>
        {showReportForm && tempIncidentLocation ? (
          <IncidentReportForm
            onSubmit={handleSubmitIncident}
            onCancel={() => {
              setShowReportForm(false);
              setTempIncidentLocation(null);
            }}
            lat={tempIncidentLocation.lat}
            lng={tempIncidentLocation.lng}
          />
        ) : (
          <DynamicIncidentMap incidents={incidents} onAddIncident={handleAddIncident} />
        )}
      </div>
    </div>
  );
};

export default DisasterInfoVerificationUI;
