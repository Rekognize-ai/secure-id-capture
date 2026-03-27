import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Search, X, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateMockFaceResults, type MockFaceSearchResult } from '@/data/mockAdminData';

type SearchState = 'idle' | 'processing' | 'results' | 'no-match' | 'error';

export default function FaceSearch() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<MockFaceSearchResult[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      runSearch();
    };
    reader.readAsDataURL(file);
  };

  const runSearch = () => {
    setSearchState('processing');
    // Simulate API call
    setTimeout(() => {
      const mockResults = generateMockFaceResults();
      if (mockResults.length > 0) {
        setResults(mockResults);
        setSearchState('results');
      } else {
        setSearchState('no-match');
      }
    }, 2500);
  };

  const clearSearch = () => {
    setUploadedImage(null);
    setResults([]);
    setSearchState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confidenceColor = (c: number) => {
    if (c >= 90) return 'text-success';
    if (c >= 75) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Face Search</h1>
        <p className="text-sm text-muted-foreground">Search enrolled inmate records by facial image</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Search Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedImage ? (
              <div className="relative">
                <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Upload Image</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Upload
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  // Simulate camera capture
                  setUploadedImage('/placeholder.svg');
                  runSearch();
                }}
              >
                <Camera className="h-4 w-4" /> Capture
              </Button>
            </div>

            {uploadedImage && searchState !== 'processing' && (
              <Button className="w-full gap-2" onClick={runSearch}>
                <Search className="h-4 w-4" /> Search Again
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2">
          {searchState === 'idle' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-base font-semibold text-foreground">Upload an Image to Search</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Upload a facial photograph or capture from camera to search against enrolled inmate records.
              </p>
            </div>
          )}

          {searchState === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-base font-semibold text-foreground">Searching Records...</h3>
              <p className="text-sm text-muted-foreground mt-1">Comparing facial features against enrolled database.</p>
            </div>
          )}

          {searchState === 'no-match' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-10 w-10 text-warning mb-4" />
              <h3 className="text-base font-semibold text-foreground">No Confident Match Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                The uploaded image did not produce any high-confidence matches in the enrolled records.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearSearch}>Try Another Image</Button>
            </div>
          )}

          {searchState === 'error' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-base font-semibold text-foreground">Search Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">Unable to process the image. Please try again.</p>
              <Button variant="outline" className="mt-4" onClick={clearSearch}>Retry</Button>
            </div>
          )}

          {searchState === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Search Results</h3>
                <Badge variant="secondary">{results.length} matches</Badge>
              </div>
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <Card
                    key={idx}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/admin/inmates/inm-0${1024 + idx}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <User className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{result.firstName} {result.lastName}</h4>
                            <Badge variant="outline" className="capitalize text-2xs">{result.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.inmateId} · {result.facility}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold tabular-nums ${confidenceColor(result.confidence)}`}>
                            {result.confidence}%
                          </p>
                          <p className="text-2xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
