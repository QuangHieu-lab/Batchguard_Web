import { Factory, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { mockFarms } from '../../data/adminMockData';
import { useFarm } from '../../contexts/FarmContext';
import { useState, useRef, useEffect } from 'react';

export function FarmSelector() {
  const { selectedFarmId, setSelectedFarmId } = useFarm();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFarm = selectedFarmId 
    ? mockFarms.find(f => f.id === selectedFarmId)
    : null;

  const activeFarms = mockFarms.filter(f => f.status === 'active');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white min-w-[200px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-blue-400" />
          <span className="text-sm">
            {selectedFarm ? selectedFarm.name : 'Tất cả hộ'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-80 bg-slate-900 border-slate-800 shadow-xl z-50">
          <CardContent className="p-2">
            {/* All Farms Option */}
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                !selectedFarmId ? 'bg-blue-600' : ''
              }`}
              onClick={() => {
                setSelectedFarmId(null);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Tất cả hộ</p>
                  <p className="text-xs text-slate-400">{activeFarms.length} hộ hoạt động</p>
                </div>
              </div>
              {!selectedFarmId && <Check className="w-4 h-4 text-white" />}
            </button>

            <div className="my-2 border-t border-slate-800" />

            {/* Individual Farms */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {activeFarms.map((farm) => (
                <button
                  key={farm.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    selectedFarmId === farm.id ? 'bg-blue-600' : ''
                  }`}
                  onClick={() => {
                    setSelectedFarmId(farm.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Factory className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{farm.name}</p>
                      <p className="text-xs text-slate-400">{farm.address}</p>
                    </div>
                  </div>
                  {selectedFarmId === farm.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}