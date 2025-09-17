"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Eye, User, Phone, MessageSquare, Calendar } from "lucide-react"
import DataTable from "../Datatable/DataTable"
import axiosInstance from "../../utils/API"
import { CONTACT_API } from "../../utils/API-ROUTES"
import toast from "react-hot-toast"

interface Contact {
  id: string
  name: string
  phoneNumber: string
  message: string
  createdAt: string
}

const ContactView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get(CONTACT_API)
        setContacts(response.data.data)
      } catch (error) {
        console.error("Error fetching contacts:", error)
        toast.error("Failed to fetch contacts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Number",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{row.original.phoneNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="max-w-[300px]" title={row.original.message}>
            {truncateMessage(row.original.message)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: "viewDetail",
      header: "View Detail",
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedContact(row.original)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Contact Messages Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={contacts}
            isLoading={isLoading}
            title="Contacts"
            totalCount={contacts.length}
            hideActions={true}
          />
        </CardContent>
      </Card>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedContact.phoneNumber}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedContact(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                    <p className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{selectedContact.name}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedContact.phoneNumber}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</label>
                  <p className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedContact.createdAt)}</span>
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Message</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mt-2">
                    <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setSelectedContact(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ContactView
