import { Zap, MapPin, Navigation2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function StationCard({ station, onClick }) {
  const isAvailable = station.status === 'available';
  const navigate = useNavigate();

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 active:scale-[0.98] transition-transform duration-200 cursor-pointer"
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0 bg-gray-100">
        <img src={station.image} alt={station.name} className="w-full h-full object-cover" />
        {station.isFast && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
            <Zap size={14} className="text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{station.name}</h3>
            <span className="text-sm font-bold text-gray-900">{station.price}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin size={12} className="mr-1" />
            <span>{station.distance}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
              isAvailable ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
            )}>
              {station.availableConnectors}/{station.totalConnectors} Available
            </div>
            {station.isFast && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                150kW
              </div>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/route', { state: { destPos: [station.lat, station.lng], destLabel: station.name } });
            }}
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
          >
            <Navigation2 size={16} className="ml-[-1px] mt-[-1px] fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
