import { useState } from "react";

export function useModal(defaultIsOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}
