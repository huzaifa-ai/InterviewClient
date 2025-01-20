export const exportToCSV = (pois: any) => {
    const headers = ['Name', 'Category', 'Sentiment', 'Latitude', 'Longitude'];
    const csvData = pois.map((poi: any) => [
        poi.name,
        poi.category,
        poi.sentiment.label,
        poi.location.coordinates[1],
        poi.location.coordinates[0],
    ]);

    const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pois_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};


export const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#10B981'; // emerald-500
      case 'negative':
        return '#EF4444'; // red-500
      case 'neutral':
        return '#6B7280'; // gray-500
      default:
        return '#6B7280';
    }
  };
  
  export const getEmotionEmoji = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'joy':
        return '😊';
      case 'sadness':
        return '😢';
      case 'anger':
        return '😠';
      case 'fear':
        return '😨';
      case 'surprise':
        return '😲';
      default:
        return '😐';
    }
  };

