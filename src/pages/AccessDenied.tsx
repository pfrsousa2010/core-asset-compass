
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDenied() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Sua conta foi desativada ou não está mais vinculada a uma empresa. Entre em contato com o administrador da sua empresa.
          </p>
          
          <Button onClick={signOut} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Fazer Login com Outra Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
