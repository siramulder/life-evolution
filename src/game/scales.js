// Scale definitions — the 3 evolutionary stages of MVP 1.0.
// Each scale unlocks when biomass reaches its threshold.
// Ordered by threshold ascending (index 0 = starting scale).

export const scales = [
  {
    id: 1,
    name: 'Primordial Soup',
    threshold: 0,
    description: 'ซุปดึกดำบรรพ์ — โมเลกุลอินทรีย์ลอยเคว้งในน้ำ รอวันก่อกำเนิดชีวิต',
  },
  {
    id: 2,
    name: 'Single Cell',
    threshold: 100,
    description: 'เซลล์แรกถือกำเนิด — นิวเคลียสก่อตัว ชีวิตเริ่มหายใจเป็นครั้งแรก',
  },
  {
    id: 3,
    name: 'Multicellular Life',
    threshold: 1000,
    description: 'สิ่งมีชีวิตหลายเซลล์ — เซลล์จับตัวกันเป็นสิ่งมีชีวิตที่ซับซ้อน',
  },
]
