interface QueryResultsProps {
    columns: string[];
    rows: (string | number | boolean | null)[][];
}

export default function QueryResults({ columns, rows }: QueryResultsProps) {
    return (
        <div className="overflow-x-auto rounded-lg border mt-3">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="px-3 py-2 text-left font-medium">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t">
                            {row.map((cell, i) => (
                                <td key={i} className="px-3 py-2">
                                    {String(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
