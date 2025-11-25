import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

const CCTVStreams = () => {
  // Replace these YouTube URLs with your actual CCTV stream links
  const streams = [
    { id: 1, title: "Main Street - North", url: "https://www.youtube.com/embed/H0Z6faxNLCI?autoplay=1&mute=0" },
    { id: 2, title: "Central Plaza", url: "https://www.youtube.com/embed/57w2gYXjRic?autoplay=1&mute=0" },
    { id: 3, title: "Park Avenue", url: "https://www.youtube.com/embed/9SLt3AT0rXk?autoplay=1&mute=0" },
    { id: 4, title: "Highway Junction", url: "https://www.youtube.com/embed/WPMgP2C3_co?autoplay=1&mute=0" },
    { id: 5, title: "City Center", url: "https://www.youtube.com/embed/1EiC9bvVGnk?autoplay=1&mute=0" },
    { id: 6, title: "Shopping Mall", url: "https://www.youtube.com/embed/CF1vS8DdBIk?autoplay=1&mute=0" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Live CCTV Camera Feeds
          </CardTitle>
          <CardDescription>
            Real-time monitoring from city surveillance cameras
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <CardTitle className="text-base">{stream.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={stream.url}
                  title={stream.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen={true}
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CCTVStreams;
