
import { useState } from "react";
import { Phone, Plus, Trash2, Edit, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface EmergencyContactsProps {
  initialContacts?: Contact[];
}

const EmergencyContacts = ({ initialContacts = [] }: EmergencyContactsProps) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts.length ? initialContacts : [
    { id: "1", name: "John Doe", phone: "(555) 123-4567", relationship: "Family", isPrimary: true },
    { id: "2", name: "Jane Smith", phone: "(555) 987-6543", relationship: "Friend", isPrimary: false },
  ]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || "Other",
        isPrimary: contacts.length === 0 // Make first contact primary by default
      };
      
      setContacts([...contacts, contact]);
      setNewContact({ name: "", phone: "", relationship: "" });
      setIsAddingContact(false);
    }
  };
  
  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
    setEditingId(null);
  };
  
  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };
  
  const handleSetPrimary = (id: string) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    })));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contactos de Emergencia</h2>
        <button
          onClick={() => setIsAddingContact(true)}
          className="flex items-center text-sm text-primary font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Añadir Contacto
        </button>
      </div>
      
      {contacts.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No hay contactos añadidos</h3>
          <p className="text-muted-foreground mt-1 max-w-xs">
            Añade contactos de emergencia que serán notificados cuando envíes una alerta.
          </p>
          <button
            onClick={() => setIsAddingContact(true)}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium"
          >
            Añadir tu primer contacto
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {contacts.map(contact => (
            <li key={contact.id} className="border border-border rounded-xl overflow-hidden animate-fade-in">
              {editingId === contact.id ? (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nombre</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded-lg border border-input bg-background"
                      value={contact.name}
                      onChange={(e) => handleUpdateContact(contact.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Teléfono</label>
                    <input
                      type="tel"
                      className="w-full p-2 rounded-lg border border-input bg-background"
                      value={contact.phone}
                      onChange={(e) => handleUpdateContact(contact.id, { phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Relación</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded-lg border border-input bg-background"
                      value={contact.relationship}
                      onChange={(e) => handleUpdateContact(contact.id, { relationship: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm rounded-lg bg-secondary text-secondary-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateContact(contact.id, {})}
                      className="px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center">
                          {contact.name}
                          {contact.isPrimary && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{contact.phone}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                          <Heart className="w-3 h-3 mr-1" />
                          {contact.relationship}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!contact.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(contact.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Establecer como contacto principal"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(contact.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Editar contacto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {isAddingContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end justify-center sm:items-center animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-elevation-high p-6 mx-4 slide-up">
            <h3 className="text-lg font-medium mb-4">Añadir contacto de emergencia</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  className="w-full p-3 mt-1 rounded-xl border border-input bg-background"
                  placeholder="Nombre del contacto"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Número de teléfono</label>
                <input
                  type="tel"
                  className="w-full p-3 mt-1 rounded-xl border border-input bg-background"
                  placeholder="(555) 123-4567"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Relación</label>
                <select
                  className="w-full p-3 mt-1 rounded-xl border border-input bg-background"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                >
                  <option value="">Seleccionar relación</option>
                  <option value="Familia">Familia</option>
                  <option value="Amigo">Amigo</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Compañero">Compañero</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-secondary text-secondary-foreground"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddContact}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium",
                    "bg-primary text-primary-foreground",
                    (!newContact.name || !newContact.phone) && "opacity-50 pointer-events-none"
                  )}
                  disabled={!newContact.name || !newContact.phone}
                >
                  Añadir contacto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
