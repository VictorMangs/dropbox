import * as Dialog from "@radix-ui/react-dialog";
import { useUploadStore } from "../store/uploadStore";

export function CyberDisclaimerDialog() {
  const showCyberDisclaimer = useUploadStore((state) => state.showCyberDisclaimer);
  const setShowCyberDisclaimer = useUploadStore((state) => state.setShowCyberDisclaimer);
  const resetTransferState = useUploadStore((state) => state.resetTransferState);

  function handleAcknowledge() {
    setShowCyberDisclaimer(false);
    resetTransferState();
  }

  return (
    <Dialog.Root open={showCyberDisclaimer}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-800 p-6 text-white shadow-xl w-full max-w-md">
          <Dialog.Title className="text-lg font-bold">
            Cyber Transfer Disclaimer
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-slate-300">
            Cyber upload is successfully queued and will be processed shortly.
            Files uploaded via cyber transfer are subject to security scanning
            and retention policies. By acknowledging, you confirm you have
            authority to transfer these files.
          </Dialog.Description>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAcknowledge}
              className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
            >
              I Acknowledge
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}