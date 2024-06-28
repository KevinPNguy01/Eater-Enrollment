import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CourseOffering, GradeDistributionCollection } from "../../../constants/types";

export function ZotisticsGraph(props: {grades: GradeDistributionCollection, offering: CourseOffering}) {
    const grades = props.grades;
    const offering = props.offering;
    const aggregate = grades.aggregate;
    const letterGrades = new Map([
        ["A", aggregate.sum_grade_a_count],
        ["B", aggregate.sum_grade_b_count],
        ["C", aggregate.sum_grade_c_count],
        ["D", aggregate.sum_grade_d_count],
        ["F", aggregate.sum_grade_f_count],
        ["P", aggregate.sum_grade_p_count],
        ["NP", aggregate.sum_grade_np_count]
    ]);
    const totalGrades = Array.from(letterGrades).map(([, count]) => count).reduce((a, b) => a + b);

    const data = Array.from(letterGrades).map(([letter, count]) => ({"letter":letter, "count":count/totalGrades*100}));

    return (
        <div className={`absolute left-full -translate-y-1/2 text-nowrap text-white text-left border border-quaternary bg-tertiary mx-4 p-4 z-20 w-fit`}>
            <p className="whitespace-pre text-lg font-bold">{`${offering.course.department} ${offering.course.number} | ${aggregate.average_gpa.toFixed(2)} GPA Average          `}</p>
            <br/>
            <ResponsiveContainer aspect={2} width="100%">
                <BarChart margin={{left:0}} data={data}>
                    <CartesianGrid stroke="#808080" strokeOpacity="100%" strokeDasharray="0" strokeWidth={1} 
                        verticalCoordinatesGenerator={({width}) => [width*.999]}
                        horizontalCoordinatesGenerator={({height}) => [0, height*.2, height*.4, height*.6]}
                    />
                    <Bar dataKey="count" fill="#0080FF"/>
                    <XAxis stroke="#FFFFFF" dataKey="letter"/>
                    <YAxis stroke="#FFFFFF" dataKey="count" unit="%" width={40} ticks={[25, 50, 75, 100]} tickLine={false}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}