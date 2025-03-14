
import MainLayout from "@/layouts/MainLayout";
import EmergencyContacts from "@/components/EmergencyContacts";

const Contacts = () => {
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Emergency Contacts</h1>
        
        <div className="flex-1 overflow-auto">
          <EmergencyContacts />
        </div>
      </div>
    </MainLayout>
  );
};

export default Contacts;
