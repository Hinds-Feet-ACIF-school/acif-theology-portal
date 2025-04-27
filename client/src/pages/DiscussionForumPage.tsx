import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Input } from "../components/ui/input.js";
import { Textarea } from "../components/ui/textarea.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import {
  MessageSquare, Search, ArrowLeft, PlusCircle, ThumbsUp, Reply, Flag, Clock, BookOpen, User, Filter, Pin, ExternalLink, UserCircle, Lock
} from "lucide-react";

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-800";
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const tabsTriggerTextLight = "text-[#4A1F1F]";
const tabsTriggerTextDark = "dark:text-[#E0D6C3]/80";
const tabsTriggerActiveTextLight = "text-[#2A0F0F]";
const tabsTriggerActiveTextDark = "dark:text-white";
const tabsTriggerActiveBgLight = "bg-white";
const tabsTriggerActiveBgDark = "dark:bg-gray-950";
const tabsTriggerHoverBgLight = "hover:bg-white/60";
const tabsTriggerHoverBgDark = "dark:hover:bg-white/10";
const tabsTriggerHoverTextLight = "hover:text-[#2A0F0F]";
const tabsTriggerHoverTextDark = "dark:hover:text-white";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const pinnedBg = "bg-yellow-100 dark:bg-yellow-900/30";
const pinnedText = "text-yellow-700 dark:text-yellow-400";
const tagBgLight = `bg-[${accentColor}]/10`;
const tagBgDark = `dark:bg-[${accentColor}]/20`;
const tagText = `text-[${accentColor}]`;

export default function DiscussionForumPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  const params = useParams();
  const courseId = params.courseId;

   const discussionTopics = [
    {
      id: 1, title: "God's Omnipresence in Daily Life", author: "Dr. Sarah Johnson", authorRole: "Instructor", course: "Foundations", courseId: "foundations", date: "May 5, 2025", replies: 12, views: 45, lastActivity: "2 days ago", pinned: true, content: "In this week's lesson, we discussed God's omnipresence...", tags: ["Week 1", "Reflection", "God's Attributes"],
    },
    {
      id: 2, title: "How does Christ's deity affect our worship?", author: "Michael Brown", authorRole: "Student", course: "Foundations", courseId: "foundations", date: "May 2, 2025", replies: 8, views: 32, lastActivity: "5 days ago", pinned: false, content: "After studying the deity of Christ, I'm curious...", tags: ["Week 2", "Christology", "Worship"],
    },
    {
      id: 3, title: "Experiences of the Holy Spirit's work", author: "James Wilson", authorRole: "Student", course: "Foundations", courseId: "foundations", date: "May 7, 2025", replies: 5, views: 28, lastActivity: "1 day ago", pinned: false, content: "This week we're exploring the person and work of the Holy Spirit...", tags: ["Week 3", "Holy Spirit", "Personal Experience"],
    },
     {
      id: 4, title: "Introduction and Prayer Requests", author: "Elizabeth Taylor", authorRole: "Student", course: "General", courseId: "general", date: "May 1, 2025", replies: 15, views: 38, lastActivity: "3 days ago", pinned: false, content: "Hello everyone! I'm Elizabeth from Toronto...", tags: ["Introduction", "Prayer Request", "Community"],
    },
    {
      id: 5, title: "Hermeneutics Q&A", author: "Dr. Sarah Johnson", authorRole: "Instructor", course: "Bible", courseId: "bible", date: "May 9, 2025", replies: 3, views: 15, lastActivity: "6 hours ago", pinned: false, content: "Please post any questions you have regarding this week's lesson on hermeneutics here.", tags: ["Week 3", "Bible", "Hermeneutics", "Q&A"],
    },
  ];

   const topicReplies = [
    { id: 1, topicId: 1, author: "John Smith", authorRole: "Student", date: "May 5, 2025", content: "I've experienced God's omnipresence most profoundly...", likes: 5, },
    { id: 2, topicId: 1, author: "Dr. Sarah Johnson", authorRole: "Instructor", date: "May 6, 2025", content: "Thank you for sharing that powerful testimony, John...", likes: 3, },
    { id: 3, topicId: 1, author: "Maria Rodriguez", authorRole: "Student", date: "May 6, 2025", content: "I've been meditating on Psalm 139 this week...", likes: 7, },
    { id: 4, topicId: 1, author: "Robert Davis", authorRole: "Student", date: "May 7, 2025", content: "One practical way I've tried to live...", likes: 4, },
  ];

   const filteredTopics = discussionTopics.filter(topic => {
     let tabMatch = false;
     if (activeTab === 'all') tabMatch = true;
     else if (activeTab === 'course' && topic.courseId !== 'general') tabMatch = true;
     else if (activeTab === 'community' && topic.courseId === 'general') tabMatch = true;

     let courseFilterMatch = true;
     if (activeTab === 'course' && selectedCourseFilter !== 'all') {
       courseFilterMatch = topic.courseId === selectedCourseFilter;
     }

     const searchMatch = searchTerm === '' ||
                         topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.author.toLowerCase().includes(searchTerm.toLowerCase());

     return tabMatch && courseFilterMatch && searchMatch;
   }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date).getTime() - new Date(a.date).getTime());

   const handlePostReply = (e: React.FormEvent) => {
        e.preventDefault();
        if(!replyContent.trim()) return;
        console.log("Posting reply:", replyContent, "to topic:", selectedTopic);
        setReplyContent("");
        setIsReplying(false);
   }

   const renderTopicContent = () => {
    const topic = discussionTopics.find((t) => t.id === selectedTopic);
    if (!topic) return null;

    const repliesForTopic = topicReplies.filter(r => r.topicId === topic.id);

    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)} className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Button>
        </div>

        <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {topic.pinned && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center font-medium ${pinnedBg} ${pinnedText}`}>
                      <Pin className="h-3 w-3 mr-1" /> Pinned
                    </span>
                  )}
                  {topic.tags.map((tag, index) => (
                    <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${tagBgLight} ${tagBgDark} ${tagText}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <CardTitle className={`text-xl md:text-2xl font-semibold font-serif ${primaryTextLight} ${primaryTextDark}`}>{topic.title}</CardTitle>
                <CardDescription className={`mt-1 text-xs sm:text-sm ${mutedTextLight} ${mutedTextDark}`}>
                  Posted by {topic.author} ({topic.authorRole}) in {topic.course} • {topic.date}
                </CardDescription>
              </div>
              <div className={`flex items-center gap-3 text-xs sm:text-sm flex-shrink-0 mt-2 sm:mt-0 ${mutedTextLight} ${mutedTextDark}`}>
                <span>{topic.views} views</span>
                <span>•</span>
                <span>{repliesForTopic.length} replies</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`prose prose-sm sm:prose-base max-w-none ${primaryTextLight} ${primaryTextDark} prose-headings:${primaryTextLight} dark:prose-headings:${primaryTextDark} prose-strong:${primaryTextLight} dark:prose-strong:${primaryTextDark} prose-a:text-[${accentColor}] hover:prose-a:text-[${accentHoverColor}] dark:prose-invert dark:prose-a:text-[${accentColor}] dark:hover:prose-a:text-[${accentHoverColor}]`}>
              <p>{topic.content}</p>
            </div>
          </CardContent>
           <CardFooter className="flex flex-col sm:flex-row justify-between border-t border-gray-200 dark:border-gray-700 pt-4 gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors flex items-center gap-1.5`}>
                <ThumbsUp className="h-4 w-4" /> Like
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors flex items-center gap-1.5`}
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-4 w-4" /> Reply
              </Button>
            </div>
            <Button variant="ghost" size="sm" className={`${mutedTextLight} ${mutedTextDark} hover:text-red-600 dark:hover:text-red-500 flex items-center gap-1.5`}>
              <Flag className="h-4 w-4" /> Report
            </Button>
          </CardFooter>
        </Card>

        {isReplying && (
          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
             <form onSubmit={handlePostReply}>
                <CardHeader>
                <CardTitle className={`text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`}>Post a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                <Textarea
                    placeholder="Share your thoughts or questions..."
                    className={`min-h-[150px] ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsReplying(false)} className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`}>
                    Cancel
                </Button>
                <Button type="submit" className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold`}>Post Reply</Button>
                </CardFooter>
            </form>
          </Card>
        )}

        <div className="space-y-4 pt-4">
          <h2 className={`text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>Replies ({repliesForTopic.length})</h2>
          {repliesForTopic.length > 0 ? (
            repliesForTopic.map((reply) => (
              <Card key={reply.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                <CardHeader className="pb-2">
                   <div className="flex items-start justify-between gap-2">
                     <div className="flex items-center gap-3">
                       <UserCircle className={`h-8 w-8 ${mutedTextLight} ${mutedTextDark} flex-shrink-0`} />
                       <div>
                         <div className={`font-medium ${primaryTextLight} ${primaryTextDark}`}>{reply.author}</div>
                         <div className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>
                           {reply.authorRole} • {reply.date}
                         </div>
                       </div>
                     </div>
                   </div>
                </CardHeader>
                <CardContent>
                  <div className={`prose prose-sm max-w-none ${primaryTextLight} ${primaryTextDark} prose-a:text-[${accentColor}] hover:prose-a:text-[${accentHoverColor}] dark:prose-invert dark:prose-a:text-[${accentColor}] dark:hover:prose-a:text-[${accentHoverColor}]`}>
                    <p>{reply.content}</p>
                  </div>
                </CardContent>
                 <CardFooter className="flex justify-between pt-2 text-xs sm:text-sm border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" className={`${secondaryTextLight} ${secondaryTextDark} hover:${tabsTriggerHoverTextLight} dark:hover:${tabsTriggerHoverTextDark} flex items-center gap-1 h-7 px-2`}>
                        <ThumbsUp className="h-3.5 w-3.5" /> Like ({reply.likes})
                    </Button>
                    <Button variant="ghost" size="sm" className={`${secondaryTextLight} ${secondaryTextDark} hover:${tabsTriggerHoverTextLight} dark:hover:${tabsTriggerHoverTextDark} flex items-center gap-1 h-7 px-2`}>
                        <Reply className="h-3.5 w-3.5" /> Reply
                    </Button>
                    </div>
                    <Button variant="ghost" size="sm" className={`${mutedTextLight} ${mutedTextDark} hover:text-red-600 dark:hover:text-red-500 flex items-center gap-1 h-7 px-2`}>
                    <Flag className="h-3.5 w-3.5" /> Report
                    </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className={`text-center py-6 ${mutedTextLight} ${mutedTextDark}`}>Be the first to reply to this discussion.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        {selectedTopic ? (
          renderTopicContent()
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
              <div>
                <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Discussion Forums</h1>
                <p className={`${secondaryTextLight} ${secondaryTextDark} mt-1`}>
                  Engage with instructors and fellow students on course topics.
                </p>
              </div>
              <Button className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Start New Discussion
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="lg:w-3/4">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className={`grid w-full grid-cols-2 sm:flex sm:w-auto rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
                       <TabsTrigger
                        value="all"
                        className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}
                       >All</TabsTrigger>
                      <TabsTrigger
                        value="course"
                        className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}
                      >Course</TabsTrigger>
                      <TabsTrigger
                        value="community"
                        className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}
                      >Community</TabsTrigger>
                    </TabsList>
                    <div className="flex w-full md:w-auto gap-2">
                       <div className="relative flex-1 md:w-64">
                        <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                        <Input
                          placeholder="Search discussions..."
                          className={`pl-8 ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {activeTab === 'course' && (
                    <div className="mb-6">
                      <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                          <SelectTrigger className={`w-full md:w-[300px] ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`}>
                              <SelectValue placeholder="Filter by course..." />
                          </SelectTrigger>
                          <SelectContent className={`border ${inputBorderLight} ${inputBorderDark} ${cardBgLight} ${cardBgDark} ${primaryTextLight} ${primaryTextDark}`}>
                              <SelectItem value="all">All Courses</SelectItem>
                              <SelectItem value="foundations">Foundations of the Christian Faith</SelectItem>
                              <SelectItem value="bible">The Bible: God's Word</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-4">
                    {filteredTopics.length > 0 ? (
                        filteredTopics.map((topic) => (
                            <Card key={topic.id} className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[${accentColor}]/50 dark:hover:border-[${accentColor}]/60 ${cardBgLight} ${cardBgDark} ${cardBorder}`} onClick={() => setSelectedTopic(topic.id)}>
                                <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        {topic.pinned && (
                                             <span className={`text-xs px-2 py-0.5 rounded-full flex items-center font-medium ${pinnedBg} ${pinnedText}`}>
                                                <Pin className="h-3 w-3 mr-1" /> Pinned
                                            </span>
                                        )}
                                        {topic.tags.map((tag, index) => (
                                            <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${tagBgLight} ${tagBgDark} ${tagText}`}>
                                            {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className={`font-semibold text-base sm:text-lg ${primaryTextLight} ${primaryTextDark} hover:text-[${accentColor}] dark:hover:text-[${accentColor}] transition-colors`}>{topic.title}</h3>
                                    <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm mt-1 ${mutedTextLight} ${mutedTextDark}`}>
                                        <span>{topic.author} ({topic.authorRole})</span>
                                        <span>•</span>
                                        <span>{topic.course}</span>
                                        <span>•</span>
                                        <span>{topic.date}</span>
                                    </div>
                                    </div>
                                    <div className={`flex flex-col items-start sm:items-end text-xs sm:text-sm flex-shrink-0 mt-2 sm:mt-0 ${mutedTextLight} ${mutedTextDark}`}>
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>{topic.replies} replies</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Last activity: {topic.lastActivity}</span>
                                    </div>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                         <div className={`text-center py-10 ${mutedTextLight} ${mutedTextDark}`}>
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>No discussions found matching your filters.</p>
                         </div>
                    )}
                  </div>
                </Tabs>
              </div>

              <div className="lg:w-1/4 space-y-6">
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-base font-semibold ${primaryTextLight} ${primaryTextDark}`}>Discussion Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className={`text-xs sm:text-sm ${secondaryTextLight} ${secondaryTextDark}`}>
                    <ul className="space-y-1.5 list-disc list-outside pl-4">
                      <li>Be respectful and courteous</li>
                      <li>Stay on topic and contribute meaningfully</li>
                      <li>Support points with Scripture appropriately</li>
                      <li>Ask clarifying questions</li>
                      <li>Respect diverse perspectives</li>
                    </ul>
                  </CardContent>
                </Card>

                 <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-base font-semibold ${primaryTextLight} ${primaryTextDark}`}>Active Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {discussionTopics.slice(0, 4).map((topic) => (
                         <div key={topic.id + topic.author} className="flex items-center gap-2">
                            <UserCircle className={`h-8 w-8 ${mutedTextLight} ${mutedTextDark} flex-shrink-0`} />
                            <div>
                              <div className={`text-sm font-medium ${primaryTextLight} ${primaryTextDark}`}>{topic.author}</div>
                              <div className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{topic.authorRole}</div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-base font-semibold ${primaryTextLight} ${primaryTextDark}`}>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className={`w-full justify-start border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`} asChild>
                        <Link to="/dashboard">
                          <User className="mr-2 h-4 w-4" /> My Dashboard
                        </Link>
                      </Button>
                       <Button variant="outline" size="sm" className={`w-full justify-start border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`} asChild>
                        <Link to={`/courses/${courseId || 'foundations'}`}>
                          <BookOpen className="mr-2 h-4 w-4" /> Current Course
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}