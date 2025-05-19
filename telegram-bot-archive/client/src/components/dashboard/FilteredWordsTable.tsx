import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/hooks/use-modal";
import { AddFilterModal } from "@/components/modals/AddFilterModal";
import type { FilteredWord } from "@shared/schema";

export default function FilteredWordsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();

  const { data: filteredWords = [], isLoading } = useQuery<FilteredWord[]>({
    queryKey: ["/api/filtered-words"],
  });

  const deleteFilteredWord = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/filtered-words/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/filtered-words"] });
      toast({
        title: "Success",
        description: "Word has been deleted from the filter list",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to delete word from filter list",
        variant: "destructive",
      });
      console.error(err);
    },
  });

  const handleDeleteWord = (id: number) => {
    if (confirm("Are you sure you want to delete this filtered word?")) {
      deleteFilteredWord.mutate(id);
    }
  };

  const getDisplayedWords = () => {
    return filteredWords
      .filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (selectedCategory === "all" || word.category === selectedCategory)
      )
      .slice(0, 5); // Show first 5 items for pagination
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "profanity":
        return "bg-red-100 text-red-800";
      case "spam":
        return "bg-yellow-100 text-yellow-800";
      case "harassment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getActionText = (word: FilteredWord) => {
    if (word.deleteMessage && word.warnUser && word.autoMute) {
      return "Delete, Warn & Mute";
    } else if (word.deleteMessage && word.warnUser) {
      return "Delete & Warn";
    } else if (word.deleteMessage) {
      return "Delete Only";
    } else if (word.warnUser) {
      return "Warn Only";
    } else {
      return "No Action";
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="bg-primary text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold">Filtered Words</h2>
          <Button 
            onClick={openModal} 
            variant="secondary" 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            size="sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search words..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="profanity">Profanity</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      Loading filtered words...
                    </td>
                  </tr>
                ) : getDisplayedWords().length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No filtered words found. Add some words to get started.
                    </td>
                  </tr>
                ) : (
                  getDisplayedWords().map((word) => (
                    <tr key={word.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {word.word}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(word.category)}`}>
                          {word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getActionText(word)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 ml-2"
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {getDisplayedWords().length} of {filteredWords.length} words
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={true}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={getDisplayedWords().length >= filteredWords.length}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AddFilterModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
