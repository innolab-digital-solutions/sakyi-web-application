import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const DataTable = () => {
  const programs = [
    {
      id: 1,
      name: 'Community Fitness Challenge',
      image: '/images/program-fitness.png',
      price: 99,
      enrollmentCount: 240,
      duration: '3 Months',
      status: 'Active',
      description:
        'A team-based challenge motivating participants to stay active and log daily activity.',
    },
    {
      id: 2,
      name: 'Mindfulness for Resilience',
      image: '/images/program-mindfulness.png',
      price: 149,
      enrollmentCount: 110,
      duration: '8 Weeks',
      status: 'Active',
      description:
        'Group-based mindfulness training focused on stress reduction and emotional well-being.',
    },
    {
      id: 3,
      name: 'Family Nutrition Bootcamp',
      image: '/images/program-nutrition.png',
      price: 129,
      enrollmentCount: 85,
      duration: '4 Weeks',
      status: 'Inactive',
      description:
        'Interactive workshops teaching healthy meal planning and cooking as a family.',
    },
    {
      id: 4,
      name: 'Workplace Wellness Series',
      image: '/images/program-workplace.png',
      price: 199,
      enrollmentCount: 160,
      duration: '6 Months',
      status: 'Active',
      description:
        'Regular meetings and check-ins promoting team-based wellbeing goals at work.',
    },
    {
      id: 5,
      name: 'Senior Social Walks',
      image: '/images/program-seniors.png',
      price: 49,
      enrollmentCount: 60,
      duration: '12 Weeks',
      status: 'Active',
      description:
        'Guided group walks to support social connection and physical health for seniors.',
    },
    {
      id: 6,
      name: 'Youth Yoga & Empowerment',
      image: '/images/program-yoga.png',
      price: 105,
      enrollmentCount: 90,
      duration: '10 Weeks',
      status: 'Active',
      description:
        'A collaborative yoga and discussion program for mental health and confidence in youth.',
    },
    {
      id: 7,
      name: 'Healthy Families Initiative',
      image: '/images/program-family.png',
      price: 159,
      enrollmentCount: 132,
      duration: '8 Weeks',
      status: 'Inactive',
      description:
        'Family counseling, shared activities, and healthy habit formation for all ages.',
    },
    {
      id: 8,
      name: 'Community Garden Project',
      image: '/images/program-garden.png',
      price: 30,
      enrollmentCount: 70,
      duration: '4 Months',
      status: 'Active',
      description:
        'Collaborative gardening program teaching nutrition and teamwork in the community.',
    },
    {
      id: 9,
      name: 'Support Circles for Wellbeing',
      image: '/images/program-circle.png',
      price: 0,
      enrollmentCount: 54,
      duration: 'Ongoing',
      status: 'Active',
      description:
        'Peer-led support groups fostering connection, accountability, and encouragement.',
    },
    {
      id: 10,
      name: 'Parents as Wellness Leaders',
      image: '/images/program-parents.png',
      price: 120,
      enrollmentCount: 44,
      duration: '6 Weeks',
      status: 'Inactive',
      description:
        'Empowering parents to lead healthy family routines with workshops and meetups.',
    },
  ];

  return (
    <div className='overflow-x-auto'>
      <Table className='min-w-full'>
        <TableHeader className='bg-muted'>
          <TableRow className='hidden md:table-row'>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Program
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Description
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Price
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Enrollments
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Duration
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Status
            </TableHead>
            <TableHead className='text-foreground/70 p-4 text-xs font-bold uppercase'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            // Responsive row: vertical stack for <md, table-style for md+
            <TableRow
              key={program.id}
              className='flex flex-col border-b md:table-row md:border-0'
            >
              {/* For mobile/tablet (<md), use stacked data; for md+ normal table */}
              <TableCell className='text-foreground/80 flex items-center gap-3 p-4 text-sm font-medium md:table-cell md:flex-none'>
                <Image
                  src={program.image}
                  alt={program.name}
                  width={32}
                  height={32}
                  className='bg-muted shrink-0 rounded-md'
                  style={{ objectFit: 'cover' }}
                />
                <span>{program.name}</span>
              </TableCell>
              <TableCell className='text-foreground/80 max-w-xs truncate p-4 text-sm font-normal md:table-cell'>
                <span className='font-semibold md:hidden'>Description: </span>
                {program.description}
              </TableCell>
              <TableCell className='text-foreground/80 p-4 text-sm font-medium md:table-cell'>
                <span className='font-semibold md:hidden'>Price: </span>
                {program.price === 0 ? 'Free' : `$${program.price}`}
              </TableCell>
              <TableCell className='text-foreground/80 p-4 text-sm font-medium md:table-cell'>
                <span className='font-semibold md:hidden'>Enrollments: </span>
                {program.enrollmentCount}
              </TableCell>
              <TableCell className='text-foreground/80 p-4 text-sm font-medium md:table-cell'>
                <span className='font-semibold md:hidden'>Duration: </span>
                {program.duration}
              </TableCell>
              <TableCell className='text-foreground/80 p-4 text-sm font-medium md:table-cell'>
                <span className='font-semibold md:hidden'>Status: </span>
                <span
                  className={
                    program.status === 'Active'
                      ? 'rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800'
                      : 'rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500'
                  }
                >
                  {program.status}
                </span>
              </TableCell>
              <TableCell className='text-foreground/80 flex items-center gap-2 p-4 text-sm font-medium md:table-cell md:flex-none md:gap-0'>
                <Button size='sm' variant='outline'>
                  View
                </Button>
                <Button size='sm' variant='outline' className='ml-2'>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
