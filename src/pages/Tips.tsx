
import MainLayout from "@/layouts/MainLayout";
import SafetyTips from "@/components/SafetyTips";

const Tips = () => {
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Safety Tips</h1>
        
        <div className="flex-1 overflow-auto">
          <SafetyTips />
        </div>
      </div>
    </MainLayout>
  );
};

export default Tips;
