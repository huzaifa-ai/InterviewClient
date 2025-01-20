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