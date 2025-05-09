import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [animationClass, setAnimationClass] = useState("");
  
  useEffect(() => {
    // Añadir animación después de que el componente se monte
    setAnimationClass("animate-in fade-in duration-500");
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 p-4">
      <Card className={`w-full max-w-md shadow-lg bg-gray-800 border-gray-700 ${animationClass}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="rounded-full bg-red-900 p-3 mb-4">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">404</h1>
            <p className="text-xl font-medium text-gray-300">Página no encontrada</p>
            <div className="w-16 h-1 bg-red-600 rounded mt-4 mb-4"></div>
          </div>

          <p className="text-center text-gray-400 mb-6">
            La pagina que estas buscando no existe o se movio de lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/'} 
              className="flex items-center justify-center gap-2 py-2 px-4 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Volver</span>
            </button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}