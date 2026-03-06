
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import type { EventInput } from '@fullcalendar/core';

import type { ProjectModule, Task } from '../types/project';

interface ProjectCalendarProps {
    modules: ProjectModule[];
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ modules }) => {
    // Transform modules/tasks to Calendar Events
    const events: EventInput[] = [];
    
    modules.forEach(m => {
        if (m.tasks) {
            m.tasks.forEach((t: Task) => {
                if (t.startDate) {
                    events.push({
                        title: t.title,
                        start: t.startDate,
                        end: t.endDate || t.startDate, // FullCalendar expects end, or defaults to 1h
                        backgroundColor: t.status === 'COMPLETE' ? '#16a34a' : (t.status === 'IN_PROGRESS' ? '#3b82f6' : '#9ca3af'),
                        borderColor: t.status === 'COMPLETE' ? '#15803d' : (t.status === 'IN_PROGRESS' ? '#2563eb' : '#6b7280'),
                        extendedProps: {
                            description: t.description,
                            moduleName: m.name
                        }
                    });
                }
            });
        }
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <style>{`
                .fc-col-header-cell-cushion { text-transform: capitalize; font-weight: 600; color: #374151; }
                .fc-daygrid-day-number { font-weight: 500; color: #4b5563; }
                .fc-event { cursor: pointer; border-radius: 4px; border: none; padding: 2px 4px; font-size: 0.75rem; }
                .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700; color: #111827; text-transform: capitalize; }
                .fc-button-primary { background-color: #ffffff !important; border-color: #e5e7eb !important; color: #374151 !important; font-weight: 500; text-transform: capitalize; }
                .fc-button-primary:hover { background-color: #f9fafb !important; border-color: #d1d5db !important; }
                .fc-button-active { background-color: #eff6ff !important; border-color: #bfdbfe !important; color: #1d4ed8 !important; }
                .fc-day-today { background-color: #f0f9ff !important; }
            `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                locale={esLocale}
                events={events}
                height="auto"
                contentHeight={600}
                eventDisplay="block"
            />
        </div>
    );
};
