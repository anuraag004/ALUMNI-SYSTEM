import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/common/DashboardLayout'
import { eventsAPI } from '../../services/api'

const CreateEvent = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        isVirtual: false,
        meetingLink: '',
        maxAttendees: ''
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Combine date and time
            const dateTime = new Date(`${formData.date}T${formData.time || '00:00'}`)
            
            const payload = {
                title: formData.title,
                description: formData.description,
                date: dateTime.toISOString(),
                venue: formData.isVirtual ? 'Virtual' : formData.venue,
                isVirtual: formData.isVirtual,
                meetingLink: formData.isVirtual ? formData.meetingLink : '',
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : null
            }

            await eventsAPI.create(payload)
            toast.success('Event created successfully! 🎉')
            navigate('/events')
        } catch (err) {
            console.error("Error creating event:", err)
            toast.error(err.message || 'Failed to create event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate('/events')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
                        ← Back to Events
                    </button>
                    <h1 className="section-heading">Create New Event</h1>
                    <p className="text-slate-400 mt-2">Host an event, workshop, or webinar for the alumni network.</p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Event Title <span className="text-rose-500">*</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} 
                                   className="input" placeholder="e.g. Intro to Tech Careers" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">Date <span className="text-rose-500">*</span></label>
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} 
                                       className="input" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">Time <span className="text-rose-500">*</span></label>
                                <input type="time" name="time" value={formData.time} onChange={handleInputChange} 
                                       className="input" required />
                            </div>
                        </div>

                        <div className="p-4 bg-surface-elevated/50 border border-brand-500/20 rounded-xl space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleInputChange} 
                                       className="w-5 h-5 rounded border-surface-border text-brand-500 focus:ring-brand-500/50 bg-surface" />
                                <span className="text-white font-medium">This is a virtual event</span>
                            </label>

                            {formData.isVirtual ? (
                                <div className="space-y-1.5 animate-slide-up">
                                    <label className="text-sm font-medium text-slate-300">Meeting Link <span className="text-rose-500">*</span></label>
                                    <input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleInputChange} 
                                           className="input" placeholder="https://zoom.us/j/..." required={formData.isVirtual} />
                                </div>
                            ) : (
                                <div className="space-y-1.5 animate-slide-up">
                                    <label className="text-sm font-medium text-slate-300">Venue / Location <span className="text-rose-500">*</span></label>
                                    <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} 
                                           className="input" placeholder="e.g. Main Auditorium, Block 3" required={!formData.isVirtual} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Max Attendees (Optional)</label>
                            <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleInputChange} 
                                   className="input" placeholder="Leave empty for unlimited" min="1" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Description <span className="text-rose-500">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} 
                                      className="input min-h-[120px]" placeholder="What is this event about?" required />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto px-10">
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CreateEvent
