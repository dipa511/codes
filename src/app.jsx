import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Car, Bike, Calendar, User, Check, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    wheels: '',
    vehicleType: '',
    specificModel: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // Fetch all vehicle types on initial load
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicle-types`);
        const data = await response.json();
        setVehicleTypes(data);
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
      }
    };
    fetchVehicleTypes();
  }, []);

  // Fetch vehicles based on selected type
  useEffect(() => {
    if (formData.vehicleType) {
      const fetchVehicles = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/vehicles/${formData.vehicleType}`);
          const data = await response.json();
          setVehicles(data);
          // To get the vehicle name for the summary, we need all vehicles
          setAllVehicles(prev => {
            const newVehicles = [...prev];
            data.forEach(v => {
              if (!newVehicles.find(nv => nv.id === v.id)) {
                newVehicles.push(v);
              }
            });
            return newVehicles;
          });
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching vehicles:', error);
          setIsLoading(false);
        }
      };
      fetchVehicles();
    }
  }, [formData.vehicleType]);

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 0:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        break;
      case 1:
        if (!formData.wheels) newErrors.wheels = 'Please select number of wheels';
        break;
      case 2:
        if (!formData.vehicleType) newErrors.vehicleType = 'Please select vehicle type';
        break;
      case 3:
        if (!formData.specificModel) newErrors.specificModel = 'Please select a specific model';
        break;
      case 4:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.dateRange = 'End date must be after start date';
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsLoading(true);
      try {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          vehicleId: formData.specificModel,
          startDate: formData.startDate,
          endDate: formData.endDate
        };

        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        setIsLoading(false);

        if (response.ok) {
          window.alert('Booking submitted successfully! 🎉');
          console.log('Booking Result:', result);
        } else {
          window.alert(`Booking Failed: ${result.message}`);
          console.error('Booking failed:', result.message);
        }
      } catch (error) {
        setIsLoading(false);
        window.alert('An error occurred during booking. Please try again.');
        console.error('Error submitting booking:', error);
      }
    }
  };

  const getVehicleName = (id) => {
    const vehicle = allVehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const steps = [
    {
      title: "What's your name?",
      subtitle: "Let's start with the basics",
      icon: <User className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm flex items-center gap-1">⚠️ {errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm flex items-center gap-1">⚠️ {errors.lastName}</p>}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How many wheels?",
      subtitle: "Choose your ride preference",
      icon: <Car className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: '4', label: '4 Wheeler', icon: '🚗', desc: 'Cars & Vehicles' },
              { value: '2', label: '2 Wheeler', icon: '🏍️', desc: 'Bikes & Motorcycles' }
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setFormData({...formData, wheels: option.value, vehicleType: '', specificModel: ''})}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.wheels === option.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{option.icon}</div>
                  <h3 className="font-semibold text-lg">{option.label}</h3>
                  <p className="text-gray-600 text-sm">{option.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.wheels && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.wheels}</p>}
        </div>
      )
    },
    {
      title: "Type of vehicle",
      subtitle: "What style fits your journey?",
      icon: formData.wheels === '2' ? <Bike className="w-8 h-8" /> : <Car className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicleTypes.filter(type => type.wheels == formData.wheels).map((type) => (
              <div
                key={type.id}
                onClick={() => setFormData({...formData, vehicleType: type.id, specificModel: ''})}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.vehicleType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{type.name === 'Hatchback' ? '🚗' : type.name === 'SUV' ? '🚐' : type.name === 'Sedan' ? '🚙' : type.name === 'Cruiser' ? '🏍️' : '🏁'}</div>
                  <h3 className="font-semibold text-lg">{type.name}</h3>
                </div>
              </div>
            ))}
          </div>
          {errors.vehicleType && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.vehicleType}</p>}
        </div>
      )
    },
    {
      title: "Choose your ride",
      subtitle: "Pick the perfect vehicle",
      icon: <MapPin className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vehicles.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setFormData({...formData, specificModel: model.id})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                    formData.specificModel === model.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{model.name}</h3>
                      <p className="text-blue-600 font-medium">₹{model.price_per_day}/day</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.specificModel === model.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {formData.specificModel === model.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.specificModel && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.specificModel}</p>}
        </div>
      )
    },
    {
      title: "When do you need it?",
      subtitle: "Select your travel dates",
      icon: <Calendar className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm flex items-center gap-1">⚠️ {errors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                min={formData.startDate || format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm flex items-center gap-1">⚠️ {errors.endDate}</p>}
            </div>
          </div>
          {errors.dateRange && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.dateRange}</p>}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Vehicle Rental Booking
          </h1>
          <p className="text-gray-600 text-lg">Find your perfect ride in just a few steps</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                  index <= currentStep
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index < currentStep ? <Check className="w-6 h-6" /> : <span className="font-semibold">{index + 1}</span>}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl text-blue-600">
                  {steps[currentStep]?.icon}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {steps[currentStep]?.title}
              </h2>
              <p className="text-gray-600 text-lg">{steps[currentStep]?.subtitle}</p>
            </div>
            <div className="mb-8">
              {steps[currentStep]?.component()}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Booking...
                    </>
                  ) : (
                    <>
                      Book Now
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {currentStep === steps.length - 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</div>
              <div><span className="font-medium">Vehicle:</span> {getVehicleName(formData.specificModel)}</div>
              <div><span className="font-medium">Dates:</span> {formData.startDate} to {formData.endDate}</div>
              <div><span className="font-medium">Duration:</span> {formData.startDate && formData.endDate ? Math.ceil((new Date(formData.endDate) - new Date(new Date(formData.startDate).getTime() + 86400000)) / (1000 * 60 * 60 * 24)) + 1 : 0} days</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;