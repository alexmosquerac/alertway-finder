import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Star, Trophy, Target, Edit, Save, X, Phone, Contact } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  points: number;
  level: number;
  verified_reports: number;
  total_reports: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    username: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setEditData({
        full_name: data.full_name || "",
        username: data.username || "",
        phone: data.phone || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: data.emergency_contact_phone || ""
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil",
          variant: "destructive"
        });
        return;
      }

      await fetchProfile();
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: "Novato", points: 0, color: "bg-gray-500" },
      { name: "Observador", points: 50, color: "bg-blue-500" },
      { name: "Colaborador", points: 100, color: "bg-green-500" },
      { name: "Vigilante", points: 200, color: "bg-yellow-500" },
      { name: "Guardián", points: 500, color: "bg-purple-500" }
    ];
    return levels[level - 1] || levels[0];
  };

  const getProgressToNextLevel = () => {
    if (!profile) return 0;
    const currentLevelInfo = getLevelInfo(profile.level);
    const nextLevelInfo = getLevelInfo(profile.level + 1);
    
    if (!nextLevelInfo) return 100;
    
    const progress = ((profile.points - currentLevelInfo.points) / (nextLevelInfo.points - currentLevelInfo.points)) * 100;
    return Math.min(progress, 100);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-4 h-full flex items-center justify-center">
          <div className="animate-pulse">Cargando perfil...</div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-4 h-full flex items-center justify-center">
          <div>No se pudo cargar el perfil</div>
        </div>
      </MainLayout>
    );
  }

  const levelInfo = getLevelInfo(profile.level);
  const progressToNext = getProgressToNextLevel();

  return (
    <MainLayout>
      <div className="p-4 h-full overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header del Perfil */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">
                {profile.full_name || "Usuario"}
              </CardTitle>
              <CardDescription>
                {user?.email}
              </CardDescription>
              <div className="flex justify-center items-center gap-2 mt-4">
                <Badge variant="secondary" className={cn("text-white", levelInfo.color)}>
                  <Trophy className="w-3 h-3 mr-1" />
                  {levelInfo.name}
                </Badge>
                <Badge variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  {profile.points} puntos
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Progreso de Gamificación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progreso de Nivel
              </CardTitle>
              <CardDescription>
                Continúa reportando para subir de nivel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nivel {profile.level}: {levelInfo.name}</span>
                  <span>Nivel {profile.level + 1}</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{profile.total_reports}</div>
                  <div className="text-sm text-muted-foreground">Reportes Totales</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">{profile.verified_reports}</div>
                  <div className="text-sm text-muted-foreground">Reportes Verificados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditData({
                        full_name: profile.full_name || "",
                        username: profile.username || "",
                        phone: profile.phone || "",
                        emergency_contact_name: profile.emergency_contact_name || "",
                        emergency_contact_phone: profile.emergency_contact_phone || ""
                      });
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editData.full_name}
                      onChange={(e) => setEditData(prev => ({...prev, full_name: e.target.value}))}
                      placeholder="Tu nombre completo"
                    />
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50">
                      {profile.full_name || "No especificado"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData(prev => ({...prev, username: e.target.value}))}
                      placeholder="Tu nombre de usuario"
                    />
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50">
                      {profile.username || "No especificado"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({...prev, phone: e.target.value}))}
                      placeholder="Tu número de teléfono"
                    />
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50">
                      {profile.phone || "No especificado"}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Contact className="w-5 h-5" />
                Contacto de Emergencia
              </CardTitle>
              <CardDescription>
                Persona que será notificada en caso de emergencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Nombre del Contacto</Label>
                {isEditing ? (
                  <Input
                    id="emergencyName"
                    value={editData.emergency_contact_name}
                    onChange={(e) => setEditData(prev => ({...prev, emergency_contact_name: e.target.value}))}
                    placeholder="Nombre del contacto de emergencia"
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50">
                    {profile.emergency_contact_name || "No especificado"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Teléfono del Contacto</Label>
                {isEditing ? (
                  <Input
                    id="emergencyPhone"
                    value={editData.emergency_contact_phone}
                    onChange={(e) => setEditData(prev => ({...prev, emergency_contact_phone: e.target.value}))}
                    placeholder="Teléfono del contacto de emergencia"
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                    {profile.emergency_contact_phone && <Phone className="w-4 h-4" />}
                    {profile.emergency_contact_phone || "No especificado"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;