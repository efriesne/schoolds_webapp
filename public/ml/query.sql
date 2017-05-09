SELECT * from success as s
LEFT OUTER JOIN enrollments as e
ON s.school_id = e.school_id
AND s.year = e.year
LEFT OUTER JOIN selectedpopulation as sp
ON sp.school_id = s.school_id
AND sp.year = s.year
LEFT OUTER JOIN teachers as t
ON t.school_id = s.school_id
AND t.year = s.school_id
LEFT OUTER JOIN racegender as rg
ON rg.school_id = s.school_id
AND rg.year = s.year
LEFT OUTER JOIN highered as h
ON h.school_id = s.school_id
AND h.year = s.year
LEFT OUTER JOIN
(SELECT incidents.school_id as a, incidents.year as b, 
	COUNT(*), SUM(incidents.days_missed), 
		(SELECT off_desc
			FROM(SELECT off_desc 
				FROM incidents 
				GROUP BY off_desc, incidents.school_id, incidents.year
				ORDER BY COUNT(*) DESC
				LIMIT 1)),
		(SELECT disc_desc
			FROM(SELECT disc_desc 
				FROM incidents 
				GROUP BY disc_desc, incidents.school_id, incidents.year
				ORDER BY COUNT(*) DESC
				LIMIT 1)) from incidents
	GROUP BY a, b)
ON a = s.school_id
AND b = s.year
LEFT OUTER JOIN tests
ON tests.school_id = s.school_id
AND tests.year = s.year
LEFT OUTER JOIN basic as bas
ON bas.school_id = s.school_id
AND bas.year = s.year;
