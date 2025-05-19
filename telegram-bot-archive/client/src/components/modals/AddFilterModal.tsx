import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertFilteredWord } from "@shared/schema";

interface AddFilterModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export function AddFilterModal({ isOpen, closeModal }: AddFilterModalProps) {
  const [word, setWord] = useState("");
  const [category, setCategory] = useState("profanity");
  const [deleteMessage, setDeleteMessage] = useState(true);
  const [warnUser, setWarnUser] = useState(true);
  const [autoMute, setAutoMute] = useState(false);
  const [autoBan, setAutoBan] = useState(false);
  const [warningsBeforeMute, setWarningsBeforeMute] = useState(3);
  const [warningsBeforeBan, setWarningsBeforeBan] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFilteredWord = useMutation({
    mutationFn: async (data: InsertFilteredWord) => {
      await apiRequest("POST", "/api/filtered-words", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/filtered-words"] });
      toast({
        title: "Success",
        description: "Word has been added to the filter list",
      });
      resetForm();
      closeModal();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to add word to filter list",
        variant: "destructive",
      });
      console.error(err);
    },
  });

  const resetForm = () => {
    setWord("");
    setCategory("profanity");
    setDeleteMessage(true);
    setWarnUser(true);
    setAutoMute(false);
    setAutoBan(false);
    setWarningsBeforeMute(3);
    setWarningsBeforeBan(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word to filter",
        variant: "destructive",
      });
      return;
    }
    
    addFilteredWord.mutate({
      word: word.trim(),
      category,
      deleteMessage,
      warnUser,
      autoMute,
      autoBan,
      warningsBeforeMute,
      warningsBeforeBan
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Filtered Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-word">Word to Filter</Label>
              <Input 
                id="filter-word" 
                placeholder="Enter word or phrase" 
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profanity">Profanity</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Action When Detected</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="action-delete" 
                    checked={deleteMessage}
                    onCheckedChange={(checked) => setDeleteMessage(checked as boolean)}
                  />
                  <Label htmlFor="action-delete" className="cursor-pointer">Delete Message</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="action-warn" 
                    checked={warnUser}
                    onCheckedChange={(checked) => setWarnUser(checked as boolean)}
                  />
                  <Label htmlFor="action-warn" className="cursor-pointer">Warn User</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="action-mute" 
                    checked={autoMute}
                    onCheckedChange={(checked) => setAutoMute(checked as boolean)}
                  />
                  <Label htmlFor="action-mute" className="cursor-pointer">
                    Auto-Mute After 
                    <Input 
                      type="number"
                      min="1"
                      max="10"
                      className="w-12 h-6 inline-block text-center mx-2"
                      value={warningsBeforeMute}
                      onChange={(e) => setWarningsBeforeMute(Number(e.target.value))}
                      disabled={!autoMute}
                    /> 
                    Warnings
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="action-ban" 
                    checked={autoBan}
                    onCheckedChange={(checked) => setAutoBan(checked as boolean)}
                  />
                  <Label htmlFor="action-ban" className="cursor-pointer">
                    Auto-Ban After 
                    <Input 
                      type="number"
                      min="1"
                      max="20"
                      className="w-12 h-6 inline-block text-center mx-2"
                      value={warningsBeforeBan}
                      onChange={(e) => setWarningsBeforeBan(Number(e.target.value))}
                      disabled={!autoBan}
                    /> 
                    Warnings
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!word.trim() || addFilteredWord.isPending}>
              {addFilteredWord.isPending ? "Adding..." : "Add Filter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
