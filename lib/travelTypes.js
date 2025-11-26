export const TRAVEL_POST_TYPES = {
    destination: {
        endpoint: 'destination',
        label: 'Destinations',
        listPath: '/destinations',
        detailPath: '/destination',
        detailFields: [
            { key: 'country', label: 'Country' },
            { key: 'attraction_type', label: 'Attraction Type' },
            { key: 'image', label: 'Image' },
            { key: 'summary', label: 'Summary' },
        ],
    },
    'travel-tip': {
        endpoint: 'travel-tip',
        label: 'Travel Tips',
        listPath: '/travel-tips',
        detailPath: '/travel-tip',
        detailFields: [
            { key: 'category', label: 'Category' },
            { key: 'tip_text', label: 'Tip' },
            { key: 'difficulty', label: 'Difficulty' },
            { key: 'image', label: 'Image' },
        ],
    },
    restaurant: {
        endpoint: 'restaurant',
        label: 'Restaurants',
        listPath: '/restaurants',
        detailPath: '/restaurant',
        detailFields: [
            { key: 'cuisine', label: 'Cuisine' },
            { key: 'price_range', label: 'Price Range' },
            { key: 'description', label: 'Description' },
            { key: 'image', label: 'Image' },
        ],
    },
};

export const TRAVEL_POST_TYPE_KEYS = Object.keys(TRAVEL_POST_TYPES);

