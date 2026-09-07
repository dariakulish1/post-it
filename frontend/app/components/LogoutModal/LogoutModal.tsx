import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const LogoutModal = ({ open, onOpenChange, children, handleLogout }: { open: boolean; onOpenChange: (open: boolean) => void; children?: React.ReactElement; handleLogout: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
                {children && <DialogTrigger render={children} />}
        <DialogContent className="max-w-[300px] md:max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Are you sure you want to log out?</DialogTitle>
                <DialogDescription>
                    You will be logged out of your account. Are you sure you want to proceed?
                </DialogDescription>
            </DialogHeader>
            <div className="flex w-full justify-end space-x-2">
                <button type="button" onClick={() => onOpenChange(false)} className="bg-gray-200 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-300">
                    Cancel
                </button>
                <button type="button" onClick={() => {
                    handleLogout();
                    onOpenChange(false);
                }} className="rounded-md py-2 px-4 text-red-700 bg-red-100 border border-red-300 hover:bg-red-200">
                    Log out
                    </button>
            </div>
        </DialogContent>
        </Dialog>
  );
};

export default LogoutModal;