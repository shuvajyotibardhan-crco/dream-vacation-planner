import React, { useState, useCallback, useMemo } from 'react';
import { Plane, Utensils, Hotel, Users, Calendar, MapPin, Loader2, Search, Dog, Landmark, FileText, DollarSign } from 'lucide-react';

// --- Constants ---
const API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 


// Helper function for exponential backoff retry logic
const fetchWithRetry = async (url, options, maxRetries = 5) => {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            } else if (response.status === 429) {
                // Too many requests, retry
                console.warn(`API Rate Limit hit, retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential increase
                continue;
            } else {
                // Other HTTP error, throw to be caught below
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error("Max retries reached. Failed to fetch:", error);
                throw error;
            }
            // Wait for delay before next retry
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    throw new Error("API call failed after multiple retries.");
};

// --- UI Components (Memoized to prevent unnecessary re-renders and maintain focus) ---

const InputField = React.memo(({ label, name, type = 'text', multiline = false, value, onChange, placeholder, icon: Icon, min = 0, rows = 3, required = false }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="w-4 h-4 mr-1 text-indigo-500" />}
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {multiline ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                required={required}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
        )}
    </div>
));

const CheckboxGroup = React.memo(({ label, name, options, selected, onChange, icon: Icon }) => (
    <fieldset className="space-y-2 p-3 bg-gray-50 rounded-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <legend className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
            {label}
        </legend>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <label key={option} className="flex items-center">
                    <input
                        type="checkbox"
                        name={name}
                        value={option}
                        checked={selected.includes(option)}
                        onChange={onChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                </label>
            ))}
        </div>
    </fieldset>
));

const RadioGroup = React.memo(({ label, name, options, selected, onChange, icon: Icon }) => (
    <fieldset className="space-y-2 p-3 bg-gray-50 rounded-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <legend className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
            {label}
        </legend>
        <div className="flex flex-wrap gap-4">
            {options.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={selected === option.value}
                        onChange={onChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
            ))}
        </div>
    </fieldset>
));

const MarkdownOutput = ({ content, sources }) => {
    if (!content) return null;

    // Simple markdown to HTML conversion for display
    const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n\n/g, '<p>') // Paragraphs (basic)
        .replace(/\n/g, '<br/>'); // Newlines

    return (
        <div className="mt-8 p-6 bg-white shadow-xl rounded-2xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400 border-b pb-2 border-gray-200 dark:border-gray-700">
                <Plane className="w-6 h-6 inline mr-2" /> Your Custom Vacation Plan
            </h2>
            <div
                className="prose max-w-none dark:prose-invert text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            {sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Sources:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- App Component ---
export default function App() {
    const [formData, setFormData] = useState({
        location: '',
        startingLocation: '',
        dates: '', 
        tripLength: 5, // Default length
        maxBudget: '',
        preferredLocations: '',
        transportation: [],
        food: [],
        accommodationType: 'Hotel',
        hotelRating: '4-Star',
        airbnbType: 'Whole House',
        adults: 2,
        kids: 0,
        infants: 0,
        dogs: 0,
        citizenship: '',
        residenceType: '',
    });

    const [plan, setPlan] = useState('');
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Determines if the date field is likely a specific range (e.g., "June 15-22")
    const isSpecificDateRange = useMemo(() => {
        const datesText = formData.dates.trim();
        if (!datesText) return false;

        // Heuristic: Check for at least two digits AND a common date separator or long phrase
        const hasEnoughDigits = (datesText.match(/\d/g) || []).length >= 2; 
        const hasDateSeparator = datesText.includes('-') || datesText.includes('/') || datesText.includes(',');
        
        // Assume specific if it has enough digits AND a separator, or if the phrase is long
        return hasEnoughDigits && (hasDateSeparator || datesText.trim().split(' ').length > 3);
    }, [formData.dates]);

    // We show the trip length input ONLY if the dates are vague (or empty)
    const showTripLengthInput = !isSpecificDateRange;
    
    // Check if trip length has been provided (mandatory only if dates are vague)
    const isTripLengthProvided = useMemo(() => formData.tripLength > 0, [formData.tripLength]);


    // --- Handlers ---

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
                    ? [...prev[name], value]
                    : prev[name].filter(item => item !== value),
            }));
        } else if (type === 'number') {
            // Using parseInt with base 10, ensures tripLength is at least 1 if set
            let numValue = parseInt(value, 10);
            if (name === 'tripLength' && numValue < 1) numValue = 1;
            else if (numValue < 0) numValue = 0;

            setFormData(prev => ({
                ...prev,
                [name]: (isNaN(numValue) && name !== 'tripLength') ? 0 : (isNaN(numValue) ? '' : numValue),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleAccommodationChange = useCallback((e) => {
        setFormData(prev => ({
            ...prev,
            accommodationType: e.target.value
        }));
    }, []);


    const generatePrompt = useMemo(() => {
        const {
            location, startingLocation, dates, tripLength, maxBudget, preferredLocations,
            transportation, food,
            accommodationType, hotelRating, airbnbType,
            adults, kids, infants, dogs, citizenship, residenceType
        } = formData;

        if (!location) return null;

        const groupDetails = [
            `${adults} adult${adults !== 1 ? 's' : ''}`,
            kids > 0 ? `${kids} child/children` : '',
            infants > 0 ? `${infants} infant${infants !== 1 ? 's' : ''}` : '',
            dogs > 0 ? `${dogs} dog${dogs !== 1 ? 's' : ''}` : ''
        ].filter(Boolean).join(', ');

        const transportList = transportation.length > 0 ? transportation.join(', ') : 'no strong preference, suggest best options';
        const foodList = food.length > 0 ? food.join(', ') : 'a mix of local and casual dining';

        const accommodationDetail = accommodationType === 'Hotel'
            ? `${hotelRating} rated hotel(s).`
            : `${airbnbType} style accommodations (e.g., Airbnb/VRBO).`;

        const visaDetails = `Citizenship: ${citizenship || 'Unknown'}. Residence Status: ${residenceType || 'Not specified'}.`;
        
        const preferredList = preferredLocations.trim() 
            ? `Preferred Locations to visit within the destination: **${preferredLocations}**.` 
            : '';

        // --- Dynamic Trip Length and Period ---
        let requestedDays = 5; // Default if length is not set
        let travelPeriodDetail;

        if (isSpecificDateRange) {
            // If dates are specific, use them as the period. Length is assumed by the model.
            travelPeriodDetail = `Travel Period: **${dates}**.`;
            requestedDays = 5; // Placeholder days, model should infer from dates
        } else {
            // Dates are vague (e.g., "September") or empty. Use tripLength.
            requestedDays = tripLength > 0 ? tripLength : 5; 
            const period = dates.trim() || 'Undetermined period';
            travelPeriodDetail = `Travel constraint: **${requestedDays}**-day duration in **${period}**.`;
        }
        
        const budgetText = maxBudget.trim() ? ` Maximum Total Budget: **${maxBudget}**.` : '';
        travelPeriodDetail += budgetText;
        
        // We use the derived or default requestedDays
        const finalRequestedDays = requestedDays;

        const systemPrompt = `You are a world-class, travel-planning AI specializing in creating realistic, comprehensive, and tailored vacation itineraries. Your goal is to generate a detailed **${finalRequestedDays}-day** plan based on the user's input, grounded in real-time information.

The plan must be formatted in clear Markdown and structured into four main sections:
1.  **Detailed Itinerary**: A **${finalRequestedDays}-day**, day-by-day plan with specific, recommended activities and routes. Ensure activities are suitable for the group size (especially kids/infants/dogs). The plan MUST incorporate the preferred locations if they were provided.
2.  **Visa Requirements**: A concise analysis of the visa, passport, and entry requirements for the destination based on the provided citizenship and residence status. State the source of this information is based on search grounding and should be verified independently.
3.  **Estimated Cost Breakdown**: A high-level estimate of the total cost in USD, broken down by main categories (Accommodation, Transportation, Activities, Food). State that this is an estimate.
4.  **Recommended Attractions**: A bulleted list of the top 3-5 specific, family-friendly attractions suitable for the group and location.

Maintain an informative and professional tone.
`;

        const userQuery = `
Please create a detailed ${finalRequestedDays}-day vacation plan.
Destination: **${location}**.
Starting Location (for general travel/cost context): **${startingLocation || 'Not specified'}**.
Travel Period/Constraint: **${travelPeriodDetail}**.
${preferredList}
Travel Group: **${groupDetails}**.
Preferred Transportation: **${transportList}**.
Food Preferences: **${foodList}**.
Accommodation Requirement: **${accommodationDetail}**.
Immigration Context: **${visaDetails}**

Generate the plan using the four required sections.
`;
        return { userQuery, systemPrompt, finalRequestedDays };
    }, [formData, isSpecificDateRange]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setPlan('');
        setSources([]);

        const prompt = generatePrompt;
        if (!prompt || !formData.location) {
            setError("Please enter a destination location to generate a plan.");
            return;
        }

        // Validation: If dates are vague (showTripLengthInput is true), trip length must be defined (> 0).
        if (showTripLengthInput && formData.tripLength < 1) {
             setError("Since you provided a general time frame (or no time frame), please specify the Approximate Trip Length (Days). This is required to create an itinerary.");
             return;
        }

        const { userQuery, systemPrompt } = prompt;

        setLoading(true);

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetchWithRetry(`${API_URL_BASE}?key=${API_KEY}`, options);
            const result = await response.json();

            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const generatedText = candidate.content.parts[0].text;
                setPlan(generatedText);

                // Extract grounding sources
                let newSources = [];
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    newSources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
                setSources(newSources);

            } else {
                setError("Could not generate a plan. The model may have blocked the request or the response was empty.");
                console.error("API response structure unexpected:", result);
            }

        } catch (err) {
            setError("An error occurred while connecting to the planning service. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [generatePrompt, formData.location, showTripLengthInput]);


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 font-['Inter']">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Dream Trip Planner
                    </h1>
                    <p className="text-lg text-indigo-600 dark:text-indigo-400">
                        Generate a personalized, real-time-informed itinerary.
                    </p>
                </header>

                {/* --- Input Form --- */}
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl dark:bg-gray-800 space-y-6">

                    {/* Section 1: Trip Details */}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">1. Trip Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Destination (City, Cruise, Attraction, etc.)"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Paris, US West Coast"
                            icon={MapPin}
                            required={true}
                        />
                         <InputField
                            label="Starting Location (City/Country)"
                            name="startingLocation"
                            value={formData.startingLocation}
                            onChange={handleChange}
                            placeholder="e.g., New York, Tokyo, London"
                            icon={Landmark}
                        />
                    </div>

                    {/* Preferred Locations for large areas */}
                    <InputField
                        label="Preferred Locations (Optional - List cities/attractions if destination is large)"
                        name="preferredLocations"
                        value={formData.preferredLocations}
                        onChange={handleChange}
                        placeholder="e.g., London, Paris, Rome (for a Europe trip)"
                        icon={MapPin}
                        multiline={true}
                        rows={3}
                    />
                    
                    {/* Time and Budget Constraints */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <InputField
                            label="Travel Dates or Months"
                            name="dates"
                            value={formData.dates}
                            onChange={handleChange}
                            placeholder="e.g., June 15-22, 2025 OR just 'September'"
                            icon={Calendar}
                        />
                        
                        {/* Conditional Trip Length Input */}
                        {showTripLengthInput && (
                            <InputField
                                label="Approximate Trip Length (Days)"
                                name="tripLength"
                                type="number"
                                value={formData.tripLength}
                                onChange={handleChange}
                                min={1}
                                icon={Calendar}
                                required={true}
                            />
                        )}
                        
                        {/* Always Available Budget Input */}
                        <InputField
                            label="Maximum Budget (Total) - Optional"
                            name="maxBudget"
                            value={formData.maxBudget}
                            onChange={handleChange}
                            placeholder="e.g., $5,000 USD (excluding flights)"
                            icon={DollarSign}
                        />

                    </div>
                    {showTripLengthInput && (
                         <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700">
                             <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                 <Calendar className="w-4 h-4 inline mr-1" />
                                 Since specific dates were not provided, **Trip Length (Days) is required** to create your itinerary.
                             </p>
                         </div>
                    )}


                    {/* Section 2: Traveler Immigration Details */}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mt-6">2. Traveler Status (for Visa Check)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Citizenship(s) of Travelers (Comma Separated)"
                            name="citizenship"
                            value={formData.citizenship}
                            onChange={handleChange}
                            placeholder="e.g., USA, India, UK"
                            icon={FileText}
                        />
                        <InputField
                            label="Residence Status (if applicable)"
                            name="residenceType"
                            value={formData.residenceType}
                            onChange={handleChange}
                            placeholder="e.g., Green Card, H1B Visa, L1, Citizen"
                            icon={FileText}
                        />
                    </div>

                    {/* Section 3: Group Size */}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mt-6">3. Group Size</h2>
                    <div className="space-y-2 p-3 bg-indigo-50 rounded-xl dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InputField label="Adults" name="adults" type="number" value={formData.adults} onChange={handleChange} min={0} />
                            <InputField label="Kids (2-12 yrs)" name="kids" type="number" value={formData.kids} onChange={handleChange} min={0} />
                            <InputField label="Infants (< 2 yrs)" name="infants" type="number" value={formData.infants} onChange={handleChange} min={0} />
                            <InputField label="Dogs" name="dogs" type="number" value={formData.dogs} onChange={handleChange} min={0} icon={Dog} />
                        </div>
                    </div>


                    {/* Section 4: Preferences */}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mt-6">4. Preferences</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CheckboxGroup
                            label="Preferred Transportation"
                            name="transportation"
                            options={['Car', 'Air (Plane)', 'Ship (Ferry/Cruise)', 'Train']}
                            selected={formData.transportation}
                            onChange={handleChange}
                            icon={Plane}
                        />

                        <CheckboxGroup
                            label="Food Choices"
                            name="food"
                            options={['Fast Food / Quick Bites', 'Casual Dining / Local Eateries', 'Fine Dining / High-End']}
                            selected={formData.food}
                            onChange={handleChange}
                            icon={Utensils}
                        />
                    </div>

                    {/* Accommodation */}
                    <div>
                        <RadioGroup
                            label="Accommodation Type"
                            name="accommodationType"
                            options={[{ label: 'Hotel', value: 'Hotel' }, { label: 'Airbnb / Similar', value: 'Airbnb' }]}
                            selected={formData.accommodationType}
                            onChange={handleAccommodationChange}
                            icon={Hotel}
                        />

                        <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                            {formData.accommodationType === 'Hotel' ? (
                                <div className="flex flex-col space-y-1">
                                    <label htmlFor="hotelRating" className="text-sm font-medium text-gray-700 dark:text-gray-300">Hotel Star Rating</label>
                                    <select
                                        id="hotelRating"
                                        name="hotelRating"
                                        value={formData.hotelRating}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="5-Star">5-Star Luxury</option>
                                        <option value="4-Star">4-Star Mid-Range (Recommended)</option>
                                        <option value="3-Star">3-Star Budget/Economy</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-1">
                                    <label htmlFor="airbnbType" className="text-sm font-medium text-gray-700 dark:text-gray-300">Airbnb/Rental Type</label>
                                    <select
                                        id="airbnbType"
                                        name="airbnbType"
                                        value={formData.airbnbType}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="Whole House">Whole House / Apartment</option>
                                        <option value="Private Room">Private Room in Shared Space</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* --- Submission --- */}
                    <button
                        type="submit"
                        // Disable if: No location OR (Trip length is showing AND Trip Length is 0)
                        disabled={loading || !formData.location || (showTripLengthInput && formData.tripLength < 1)}
                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg transition-all duration-300
                            ${loading || !formData.location || (showTripLengthInput && formData.tripLength < 1)
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Your Plan...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-5 w-5" />
                                Generate Custom Plan
                            </>
                        )}
                    </button>

                    {/* --- Error Display --- */}
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </form>

                {/* --- Output Display --- */}
                <MarkdownOutput content={plan} sources={sources} />

            </div>
        </div>
    );
}
