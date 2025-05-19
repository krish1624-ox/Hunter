import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useModal } from "@/hooks/use-modal";
import { AddFilterModal } from "@/components/modals/AddFilterModal";
import type { FilteredWord } from "@shared/schema";

export default function FilterWords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
        (categoryFilter === "all" || word.category === categoryFilter)
      );
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
    const actions = [];
    if (word.deleteMessage) actions.push("Delete");
    if (word.warnUser) actions.push("Warn");
    if (word.autoMute) actions.push(`Mute (after ${word.warningsBeforeMute} warnings)`);
    if (word.autoBan) actions.push(`Ban (after ${word.warningsBeforeBan} warnings)`);
    
    return actions.join(", ") || "No action";
  };

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Filter Words</h1>
        <p className="text-gray-600">Manage the words and phrases that trigger moderation actions</p>
      </header>

      <Card>
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
            <span>Add New Word</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Label htmlFor="search-words" className="mb-2 block">Search Filtered Words</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <Input
                  id="search-words"
                  type="text"
                  placeholder="Search by word..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter" className="mb-2 block">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
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

          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Loading filtered words...</p>
            </div>
          ) : getDisplayedWords().length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
                <path d="M13 2v7h7"></path>
                <line x1="9" y1="18" x2="15" y2="18"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
                <line x1="9" y1="10" x2="12" y2="10"></line>
              </svg>
              <p className="mt-2 text-gray-600">No filtered words found. Add some words to get started.</p>
              <Button onClick={openModal} variant="outline" className="mt-4">
                Add First Word
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Manage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getDisplayedWords().map((word) => (
                    <tr key={word.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {word.word}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(word.category)}`}>
                          {word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getActionText(word)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-focus h-8 mr-2">
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 h-8"
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddFilterModal isOpen={isOpen} closeModal={closeModal} />
    </div>
  );
}
