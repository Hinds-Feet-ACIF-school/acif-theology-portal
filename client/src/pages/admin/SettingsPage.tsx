import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js"
import { Input } from "../../components/ui/input.js"
import { Textarea } from "../../components/ui/textarea.js"
import { Checkbox } from "../../components/ui/checkbox.js"
import { Label } from "../../components/ui/label.js"
import { Switch } from "../../components/ui/switch.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.js"
import { ArrowLeft, Save, Globe, Bell, Shield, Users, Mail, PlusCircle } from "lucide-react"


const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-[#FFFDFB]';
const darkCardBg = 'dark:bg-gray-900';
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const switchActiveBg = 'data-[state=checked]:bg-[#C5A467]';
const checkboxIndicator = 'data-[state=checked]:bg-[#C5A467] data-[state=checked]:text-[#2A0F0F] border-[#4A1F1F] dark:border-[#E0D6C3]';


export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (

    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center gap-2 mb-6">

          <Link to="/admin" className={`flex items-center ${goldAccent} hover:underline`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>

            <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Settings</h1>
            <p className={`${midBrown}`}>Manage system settings and configurations</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-8" onValueChange={setActiveTab}>

          <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 rounded-md">

            <TabsTrigger
              value="general"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Integrations
            </TabsTrigger>
          </TabsList>


          <TabsContent value="general" className="space-y-6">
            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Program Information</CardTitle>
                <CardDescription className={`${midBrown}`}>Basic information about your theological program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="programName" className={`${deepBrown}`}>Program Name</Label>
                  <Input id="programName" defaultValue="Certificate in Apostolic & Evangelical Theology" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution" className={`${deepBrown}`}>Institution Name</Label>
                  <Input id="institution" defaultValue="International Apostolic Church" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className={`${deepBrown}`}>Program Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    defaultValue="A six-month online program providing foundational Christian doctrines and practical ministry skills from an Apostolic perspective."
                    className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className={`${deepBrown}`}>Website</Label>
                    <Input id="website" defaultValue="https://apostolictheology.org" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`${deepBrown}`}>Contact Email</Label>
                    <Input id="email" type="email" defaultValue="info@apostolictheology.org" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>

                <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Appearance</CardTitle>
                <CardDescription className={`${midBrown}`}>Customize the look and feel of your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className={`${deepBrown}`}>Primary Color</Label>
                  <div className="flex items-center gap-2">

                    <Input id="primaryColor" defaultValue="#C5A467" className={`w-32 ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                    <div className="w-10 h-10 rounded-md bg-[#C5A467]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className={`${deepBrown}`}>Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input id="logo" type="file" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} file:text-[#4A1F1F] dark:file:text-[#E0D6C3] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100/50 dark:file:bg-gray-800/50 hover:file:bg-gray-200/70 dark:hover:file:bg-gray-700/70`} />

                    <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Upload</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon" className={`${deepBrown}`}>Favicon</Label>
                  <div className="flex items-center gap-2">
                     <Input id="favicon" type="file" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} file:text-[#4A1F1F] dark:file:text-[#E0D6C3] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100/50 dark:file:bg-gray-800/50 hover:file:bg-gray-200/70 dark:hover:file:bg-gray-700/70`} />
                     <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Upload</Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">

                   <Switch id="darkMode" className={switchActiveBg} />
                   <Label htmlFor="darkMode" className={`${deepBrown}`}>Enable Dark Mode Option</Label>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Save className="mr-2 h-4 w-4" />
                   Save Changes
                 </Button>
              </CardFooter>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Regional Settings</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure language and timezone preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="language" className={`${deepBrown}`}>Default Language</Label>
                  <Select defaultValue="en">
                     <SelectTrigger className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}>
                       <SelectValue placeholder="Select language" />
                     </SelectTrigger>
                     <SelectContent className={`${lightBg} ${darkBg} border ${inputBorder} ${deepBrown}`}>
                       <SelectItem value="en">English</SelectItem>
                       <SelectItem value="es">Spanish</SelectItem>
                       <SelectItem value="fr">French</SelectItem>
                       <SelectItem value="pt">Portuguese</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className={`${deepBrown}`}>Default Timezone</Label>
                  <Select defaultValue="utc">
                     <SelectTrigger className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}>
                       <SelectValue placeholder="Select timezone" />
                     </SelectTrigger>
                     <SelectContent className={`${lightBg} ${darkBg} border ${inputBorder} ${deepBrown}`}>
                       <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                       <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                       <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                       <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                       <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className={`${deepBrown}`}>Date Format</Label>
                  <Select defaultValue="mdy">
                     <SelectTrigger className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}>
                       <SelectValue placeholder="Select date format" />
                     </SelectTrigger>
                     <SelectContent className={`${lightBg} ${darkBg} border ${inputBorder} ${deepBrown}`}>
                       <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                       <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                       <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                   <Switch id="multilingual" className={switchActiveBg}/>
                   <Label htmlFor="multilingual" className={`${deepBrown}`}>Enable Multilingual Support</Label>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Globe className="mr-2 h-4 w-4" />
                   Save Regional Settings
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>


          <TabsContent value="notifications" className="space-y-6">
            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Email Notifications</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure email notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="assignment-notifications" className={`${deepBrown}`}>Assignment Notifications</Label>
                      <p className={`text-sm ${mutedText}`}>
                        Send notifications when new assignments are posted
                      </p>
                    </div>
                    <Switch id="assignment-notifications" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="grade-notifications" className={`${deepBrown}`}>Grade Notifications</Label>
                      <p className={`text-sm ${mutedText}`}>Send notifications when assignments are graded</p>
                    </div>
                    <Switch id="grade-notifications" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="discussion-notifications" className={`${deepBrown}`}>Discussion Notifications</Label>
                      <p className={`text-sm ${mutedText}`}>Send notifications for new discussion posts</p>
                    </div>
                    <Switch id="discussion-notifications" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="announcement-notifications" className={`${deepBrown}`}>Announcement Notifications</Label>
                      <p className={`text-sm ${mutedText}`}>Send notifications for new announcements</p>
                    </div>
                    <Switch id="announcement-notifications" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder-notifications" className={`${deepBrown}`}>Reminder Notifications</Label>
                      <p className={`text-sm ${mutedText}`}>Send reminders for upcoming deadlines</p>
                    </div>
                    <Switch id="reminder-notifications" defaultChecked className={switchActiveBg}/>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Bell className="mr-2 h-4 w-4" />
                   Save Notification Settings
                 </Button>
              </CardFooter>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Email Templates</CardTitle>
                <CardDescription className={`${midBrown}`}>Customize email notification templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template" className={`${deepBrown}`}>Select Template</Label>
                  <Select defaultValue="welcome">
                     <SelectTrigger className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}>
                       <SelectValue placeholder="Select template" />
                     </SelectTrigger>
                     <SelectContent className={`${lightBg} ${darkBg} border ${inputBorder} ${deepBrown}`}>
                       <SelectItem value="welcome">Welcome Email</SelectItem>
                       <SelectItem value="assignment">New Assignment</SelectItem>
                       <SelectItem value="grade">Grade Notification</SelectItem>
                       <SelectItem value="reminder">Deadline Reminder</SelectItem>
                       <SelectItem value="announcement">Announcement</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className={`${deepBrown}`}>Email Subject</Label>
                  <Input id="subject" defaultValue="Welcome to the Certificate in Apostolic & Evangelical Theology" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body" className={`${deepBrown}`}>Email Body</Label>
                  <Textarea
                    id="body"
                    rows={8}
                    defaultValue="Dear [Student Name],

Welcome to the Certificate in Apostolic & Evangelical Theology program! We're excited to have you join our community of learners.

Your account has been successfully created, and you can now log in to access your courses and learning materials.

If you have any questions, please don't hesitate to contact us at support@apostolictheology.org.

Blessings,
The Apostolic Theology Team"
                    className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`${deepBrown}`}>Available Variables</Label>

                  <div className={`text-sm ${midBrown} space-y-1`}>
                    <p><code className="font-mono p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">\[Student Name]</code> - Student's full name</p>
                    <p><code className="font-mono p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">\[Course Name]</code> - Course title</p>
                    <p><code className="font-mono p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">\[Assignment Name]</code> - Assignment title</p>
                    <p><code className="font-mono p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">\[Due Date]</code> - Assignment due date</p>
                    <p><code className="font-mono p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">\[Grade]</code> - Student's grade</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Mail className="mr-2 h-4 w-4" />
                   Save Template
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>


          <TabsContent value="security" className="space-y-6">
            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Authentication Settings</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure authentication and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor" className={`${deepBrown}`}>Two-Factor Authentication</Label>
                      <p className={`text-sm ${mutedText}`}>
                        Require two-factor authentication for all admin accounts
                      </p>
                    </div>
                    <Switch id="two-factor" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="password-complexity" className={`${deepBrown}`}>Password Complexity Requirements</Label>
                      <p className={`text-sm ${mutedText}`}>Require strong passwords with special characters</p>
                    </div>
                    <Switch id="password-complexity" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="password-expiry" className={`${deepBrown}`}>Password Expiry</Label>
                      <p className={`text-sm ${mutedText}`}>Require password changes every 90 days</p>
                    </div>
                    <Switch id="password-expiry" className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="account-lockout" className={`${deepBrown}`}>Account Lockout</Label>
                      <p className={`text-sm ${mutedText}`}>Lock accounts after 5 failed login attempts</p>
                    </div>
                    <Switch id="account-lockout" defaultChecked className={switchActiveBg}/>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="session-timeout" className={`${deepBrown}`}>Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Shield className="mr-2 h-4 w-4" />
                   Save Security Settings
                 </Button>
              </CardFooter>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Privacy Settings</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure data privacy and protection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-retention" className={`${deepBrown}`}>Data Retention Policy</Label>
                      <p className={`text-sm ${mutedText}`}>
                        Automatically delete inactive user data after 2 years
                      </p>
                    </div>
                    <Switch id="data-retention" className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="privacy-policy" className={`${deepBrown}`}>Privacy Policy Consent</Label>
                      <p className={`text-sm ${mutedText}`}>
                        Require users to consent to privacy policy on registration
                      </p>
                    </div>
                    <Switch id="privacy-policy" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-export" className={`${deepBrown}`}>User Data Export</Label>
                      <p className={`text-sm ${mutedText}`}>Allow users to export their personal data</p>
                    </div>
                    <Switch id="data-export" defaultChecked className={switchActiveBg}/>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="privacy-policy-url" className={`${deepBrown}`}>Privacy Policy URL</Label>
                  <Input id="privacy-policy-url" defaultValue="https://apostolictheology.org/privacy" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms-url" className={`${deepBrown}`}>Terms of Service URL</Label>
                  <Input id="terms-url" defaultValue="https://apostolictheology.org/terms" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Shield className="mr-2 h-4 w-4" />
                   Save Privacy Settings
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>


          <TabsContent value="users" className="space-y-6">
            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>User Roles</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div>
                      <h3 className={`font-medium ${deepBrown}`}>Administrator</h3>
                      <p className={`text-sm ${midBrown}`}>Full access to all system features</p>
                    </div>
                    <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Edit Permissions</Button>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div>
                      <h3 className={`font-medium ${deepBrown}`}>Instructor</h3>
                      <p className={`text-sm ${midBrown}`}>Can manage courses, assignments, and grade students</p>
                    </div>
                    <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Edit Permissions</Button>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div>
                      <h3 className={`font-medium ${deepBrown}`}>Teaching Assistant</h3>
                      <p className={`text-sm ${midBrown}`}>Can grade assignments and manage discussions</p>
                    </div>
                    <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Edit Permissions</Button>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div>
                      <h3 className={`font-medium ${deepBrown}`}>Student</h3>
                      <p className={`text-sm ${midBrown}`}>Can access courses and submit assignments</p>
                    </div>
                    <Button variant="outline" className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}>Edit Permissions</Button>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Role
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>User Registration</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure user registration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="open-registration" className={`${deepBrown}`}>Open Registration</Label>
                      <p className={`text-sm ${mutedText}`}>Allow users to register without an invitation</p>
                    </div>
                    <Switch id="open-registration" className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-verification" className={`${deepBrown}`}>Email Verification</Label>
                      <p className={`text-sm ${mutedText}`}>
                        Require email verification before account activation
                      </p>
                    </div>
                    <Switch id="email-verification" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="admin-approval" className={`${deepBrown}`}>Admin Approval</Label>
                      <p className={`text-sm ${mutedText}`}>Require admin approval for new registrations</p>
                    </div>
                    <Switch id="admin-approval" defaultChecked className={switchActiveBg}/>
                  </div>
                </div>
                <div className="space-y-2 pt-4">

                   <Label className={`${deepBrown}`}>Required Registration Fields</Label>
                   <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                       <Checkbox id="field-name" defaultChecked className={checkboxIndicator} />
                       <Label htmlFor="field-name" className={`${deepBrown}`}>Full Name</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Checkbox id="field-email" defaultChecked className={checkboxIndicator}/>
                       <Label htmlFor="field-email" className={`${deepBrown}`}>Email</Label>
                     </div>
                      <div className="flex items-center space-x-2">
                       <Checkbox id="field-country" defaultChecked className={checkboxIndicator}/>
                       <Label htmlFor="field-country" className={`${deepBrown}`}>Country</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Checkbox id="field-church" defaultChecked className={checkboxIndicator}/>
                       <Label htmlFor="field-church" className={`${deepBrown}`}>Church Affiliation</Label>
                     </div>
                   </div>
                 </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Users className="mr-2 h-4 w-4" />
                   Save Registration Settings
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>


          <TabsContent value="integrations" className="space-y-6">
            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Payment Integrations</CardTitle>
                <CardDescription className={`${midBrown}`}>Configure payment gateways for course registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">

                      <div className={`rounded-full ${goldAccentBgLight} p-2`}>

                         <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

                           <rect width="24" height="24" rx="4" fill="currentColor"/>
                           <path d="M7 15h10M7 11h10M7 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                         </svg>
                      </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Stripe</h3>
                        <p className={`text-sm ${midBrown}`}>Credit card payments</p>
                      </div>
                    </div>
                    <Switch id="stripe-enabled" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full ${goldAccentBgLight} p-2`}>
                         <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect width="24" height="24" rx="4" fill="currentColor"/>
                           <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                         </svg>
                      </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>PayPal</h3>
                        <p className={`text-sm ${midBrown}`}>PayPal payments</p>
                      </div>
                    </div>
                    <Switch id="paypal-enabled" className={switchActiveBg}/>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">
                       <div className={`rounded-full ${goldAccentBgLight} p-2`}>
                         <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect width="24" height="24" rx="4" fill="currentColor"/>
                           <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
                         </svg>
                       </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Bank Transfer</h3>
                        <p className={`text-sm ${midBrown}`}>Manual bank transfers</p>
                      </div>
                    </div>
                    <Switch id="bank-enabled" defaultChecked className={switchActiveBg}/>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="stripe-key" className={`${deepBrown}`}>Stripe API Key</Label>
                  <Input id="stripe-key" type="password" defaultValue="sk_test_123456789" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-client" className={`${deepBrown}`}>PayPal Client ID</Label>
                  <Input id="paypal-client" type="password" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-details" className={`${deepBrown}`}>Bank Transfer Details</Label>
                  <Textarea
                    id="bank-details"
                    rows={4}
                    defaultValue="Bank: First National Bank
Account Name: International Apostolic Church
Account Number: 1234567890
Routing Number: 987654321
Reference: [Student Name]"
                    className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`}
                  />
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Save className="mr-2 h-4 w-4" />
                   Save Payment Settings
                 </Button>
              </CardFooter>
            </Card>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Third-Party Integrations</CardTitle>
                <CardDescription className={`${midBrown}`}>Connect with external services and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-4">

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full ${goldAccentBgLight} p-2`}>
                        <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="currentColor"/>
                          <path d="M5 19l14-14M5 5h14v14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Google Analytics</h3>
                        <p className={`text-sm ${midBrown}`}>Track website usage and analytics</p>
                      </div>
                    </div>
                    <Switch id="analytics-enabled" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">
                       <div className={`rounded-full ${goldAccentBgLight} p-2`}>
                         <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect width="24" height="24" rx="4" fill="currentColor"/>
                           <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                         </svg>
                      </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Zoom</h3>
                        <p className={`text-sm ${midBrown}`}>Video conferencing for live sessions</p>
                      </div>
                    </div>
                    <Switch id="zoom-enabled" defaultChecked className={switchActiveBg}/>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                    <div className="flex items-center gap-3">
                       <div className={`rounded-full ${goldAccentBgLight} p-2`}>
                         <svg className={`h-6 w-6 ${goldAccent}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect width="24" height="24" rx="4" fill="currentColor"/>
                           <path d="M7 7l10 10M7 17L17 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                         </svg>
                       </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Mailchimp</h3>
                        <p className={`text-sm ${midBrown}`}>Email marketing and newsletters</p>
                      </div>
                    </div>
                    <Switch id="mailchimp-enabled" className={switchActiveBg}/>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="analytics-id" className={`${deepBrown}`}>Google Analytics ID</Label>
                  <Input id="analytics-id" defaultValue="UA-123456789-1" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoom-api" className={`${deepBrown}`}>Zoom API Key</Label>
                  <Input id="zoom-api" type="password" defaultValue="ZoomAPIKey123" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mailchimp-api" className={`${deepBrown}`}>Mailchimp API Key</Label>
                  <Input id="mailchimp-api" type="password" className={`${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}>
                   <Save className="mr-2 h-4 w-4" />
                   Save Integration Settings
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}