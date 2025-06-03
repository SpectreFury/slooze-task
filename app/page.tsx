import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-lg border-2 border-neutral-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-neutral-800 mb-2">
            Welcome to Slooze
          </CardTitle>
          <p className="text-lg text-neutral-600">
            Your favorite food delivery app
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-neutral-700 mb-4">
              Discover amazing restaurants and get your favorite meals delivered right to your door.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 text-lg">
                Sign In
              </Button>
            </Link>
            
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 text-lg">
                Create Account
              </Button>
            </Link>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-neutral-500">
              Join thousands of users who trust Slooze for their food delivery needs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
