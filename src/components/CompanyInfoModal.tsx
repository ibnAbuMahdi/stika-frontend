"use client";

import { X } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCompanyInfo: () => void;
}

export default function CompanyInfoModal({
  isOpen,
  onClose,
  onUpdateCompanyInfo
}: CompanyInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="text-center p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STIKA Logo */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h2 className="text-2xl font-bold">
            <span className="text-purple-600">ST</span>
            <span className="text-pink-600">I</span>
            <span className="text-yellow-500">K</span>
            <span className="text-purple-600">A</span>
          </h2>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-700 text-base leading-relaxed">
            To create a campaign, kindly Update your company info.
          </p>
        </div>

        {/* Update button */}
        <Button
          onClick={onUpdateCompanyInfo}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Update company info
        </Button>
      </ModalContent>
    </Modal>
  );
}