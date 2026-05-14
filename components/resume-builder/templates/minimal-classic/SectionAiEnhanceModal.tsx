"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
/** Any resume template JSON that includes AI modal strings under `editor` + `ai`. */
export type SectionAiEnhanceCopy = {
  editor: {
    aiModalTitle: string
    aiInstructionLabel: string
    aiInstructionPlaceholder: string
    aiApply: string
    aiCancel: string
    aiWorking: string
  }
  ai: {
    defaultInstruction: string
    sectionContextHeader: string
  }
}

export function SectionAiEnhanceModal({
  copy,
  open,
  sectionLabel,
  initialInstruction,
  onClose,
  onConfirm,
  loading,
}: {
  copy: SectionAiEnhanceCopy
  open: boolean
  sectionLabel: string
  initialInstruction: string
  onClose: () => void
  onConfirm: (instruction: string) => void
  loading: boolean
}) {
  const [instruction, setInstruction] = useState(initialInstruction)

  useEffect(() => {
    if (open) setInstruction(initialInstruction)
  }, [open, initialInstruction])

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`${copy.editor.aiModalTitle} — ${sectionLabel}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <Label>{copy.editor.aiInstructionLabel}</Label>
          <Textarea
            className="mt-2 min-h-[100px]"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={copy.editor.aiInstructionPlaceholder}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {copy.editor.aiCancel}
          </Button>
          <Button type="button" onClick={() => onConfirm(instruction)} disabled={loading}>
            {loading ? copy.editor.aiWorking : copy.editor.aiApply}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
