import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiRoom, adminAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle,
  X,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const SUITE_TYPES = [
  'Deluxe Ocean Suite',
  'Executive Suite',
  'Garden Villa',
  'Penthouse Suite',
  'Ocean Terrace Suite',
];

const PRESET_IMAGES = [
  { label: 'Deluxe Ocean View', path: '/src/assets/images/room_deluxe_ocean_1793034471458.jpg' },
  { label: 'Executive Penthouse', path: '/src/assets/images/room_executive_suite_1793034471925.jpg' },
  { label: 'Garden Pool Villa', path: '/src/assets/images/room_garden_villa_1793034472248.jpg' },
  { label: 'Hotel Resort Facade', path: '/src/assets/images/hero_hotel_resort_1793034471010.jpg' },
  { label: 'Subterranean Spa', path: '/src/assets/images/hotel_amenities_spa_1793034472431.jpg' },
];

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<ApiRoom | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('Deluxe Ocean Suite');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pricePerNight, setPricePerNight] = useState<number>(380);
  const [capacity, setCapacity] = useState<number>(2);
  const [bedType, setBedType] = useState<string>('King Bed');
  const [sizeSqFt, setSizeSqFt] = useState<number>(650);
  const [view, setView] = useState<string>('Oceanfront Panoramic');
  const [floor, setFloor] = useState<number>(1);
  const [amenitiesInput, setAmenitiesInput] = useState<string>(
    'Oceanfront Balcony, Free Ultra-Speed WiFi, Deep Soaking Tub, Spa Access'
  );
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0].path);
  const [operationalStatus, setOperationalStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getRooms();
      setRooms(res.rooms);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomNumber(String(100 + rooms.length + 1));
    setRoomType('Deluxe Ocean Suite');
    setTitle('Azure Coastal Deluxe Suite');
    setDescription('Refined suite with panoramic views, custom furniture, and marble bath.');
    setPricePerNight(390);
    setCapacity(2);
    setBedType('King Bed');
    setSizeSqFt(650);
    setView('Oceanfront');
    setFloor(2);
    setAmenitiesInput('Oceanfront Balcony, Free Ultra-Speed WiFi, Deep Soaking Tub, Spa Access');
    setSelectedImage(PRESET_IMAGES[0].path);
    setOperationalStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (room: ApiRoom) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setTitle(room.title);
    setDescription(room.description);
    setPricePerNight(room.pricePerNight);
    setCapacity(room.capacity);
    setBedType(room.bedType);
    setSizeSqFt(room.sizeSqFt);
    setView(room.view);
    setFloor(room.floor);
    setAmenitiesInput(room.amenities.join(', '));
    setSelectedImage(room.images[0] || PRESET_IMAGES[0].path);
    setOperationalStatus(room.operationalStatus);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);

    const amenities = amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean);

    try {
      if (editingRoom) {
        await adminAPI.updateRoom(editingRoom.id, {
          roomNumber,
          roomType,
          title,
          description,
          pricePerNight: Number(pricePerNight),
          capacity: Number(capacity),
          bedType,
          sizeSqFt: Number(sizeSqFt),
          view,
          floor: Number(floor),
          amenities,
          images: [selectedImage],
          operationalStatus,
        });
        setNotification(`Room #${roomNumber} updated successfully.`);
      } else {
        await adminAPI.createRoom({
          roomNumber,
          roomType,
          title,
          description,
          pricePerNight: Number(pricePerNight),
          capacity: Number(capacity),
          bedType,
          sizeSqFt: Number(sizeSqFt),
          view,
          floor: Number(floor),
          amenities,
          images: [selectedImage],
          operationalStatus,
        });
        setNotification(`Room #${roomNumber} created and listed in inventory.`);
      }
      setIsModalOpen(false);
      await loadRooms();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save room';
      alert(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleMaintenance = async (room: ApiRoom) => {
    const nextStatus = room.operationalStatus === 'maintenance' ? 'active' : 'maintenance';
    try {
      await adminAPI.updateRoom(room.id, { operationalStatus: nextStatus });
      setNotification(
        `Room #${room.roomNumber} operational status changed to: ${nextStatus}. ${
          nextStatus === 'maintenance'
            ? 'Room is now locked from new guest bookings.'
            : 'Room is now active for guest reservations.'
        }`
      );
      await loadRooms();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating operational status';
      alert(message);
    }
  };

  const handleDeleteRoom = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove Room #${num}?`)) return;
    try {
      await adminAPI.deleteRoom(id);
      setNotification(`Room #${num} removed from active inventory.`);
      await loadRooms();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      alert(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-semibold text-stone-900">
            Room Inventory & Status Management
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Configure room listings, set nightly pricing, manage housekeeping maintenance mode, and
            update inventory.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Suite Title & Type</th>
                  <th className="py-3 px-4">Rate / Night</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Floor & Size</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      #{r.roomNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.images[0]}
                          alt={r.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-10 rounded object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <strong className="block text-stone-900 font-medium">{r.title}</strong>
                          <span className="text-[11px] text-stone-500">{r.roomType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-stone-900">
                      ${r.pricePerNight}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {r.capacity} Guests ({r.bedType})
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      Floor {r.floor} · {r.sizeSqFt} sq ft
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.operationalStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleMaintenance(r)}
                          title={
                            r.operationalStatus === 'maintenance'
                              ? 'Return to Active Status'
                              : 'Put Under Maintenance / Turnover'
                          }
                          className={`p-1.5 rounded border transition-colors ${
                            r.operationalStatus === 'maintenance'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          title="Edit Room"
                          className="p-1.5 rounded border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id, r.roomNumber)}
                          title="Deactivate Room"
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-serif font-semibold text-stone-900">
                {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Create New Room Listing'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Price / Night ($)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Max Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">Suite Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  >
                    {SUITE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Floor</label>
                  <input
                    type="number"
                    min="1"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Suite Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Azure Horizon Deluxe Suite"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Bed Type</label>
                  <input
                    type="text"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    placeholder="e.g. California King"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Size (sq ft)</label>
                  <input
                    type="number"
                    value={sizeSqFt}
                    onChange={(e) => setSizeSqFt(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Orientation / View</label>
                  <input
                    type="text"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                    placeholder="e.g. Oceanfront Panoramic"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              {/* Photo selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Primary Room Image</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img.path)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img.path
                          ? 'border-amber-800 ring-2 ring-amber-800/40'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.path}
                        alt={img.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Operational Status */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-stone-700">Initial Operational Status</label>
                <select
                  value={operationalStatus}
                  onChange={(e) =>
                    setOperationalStatus(e.target.value as 'active' | 'maintenance' | 'inactive')
                  }
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                >
                  <option value="active">Active (Available for reservations)</option>
                  <option value="maintenance">Maintenance (Turnover / Cleaning / Repair)</option>
                  <option value="inactive">Inactive (Decommissioned)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
