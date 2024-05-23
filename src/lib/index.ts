// place files you want to import through the `$lib` alias in this folder.


export type CharacterData = {
    name: string,
    weapons: {
        name: string,
        shootSkills: (Skill & { hitGuarantee: boolean })[],
        improvementSkill: (Skill & { improves: 'distance' | 'movement' | 'size' | 'weapon' | 'total', factor: number, canReduceBelowZero?: boolean })[]
        weaponModifiers: {
            minimum: number,
            maximum: number,
            modifier: number
        }[]
    }[],
};

type Skill = {
    id: number,
    name: string,
    baseValue: number,
    value: number,
}




const data: CharacterData[] = [
    {
        "name": "Archer",
        "weapons": [
            {
                "name": "Longbow",
                "shootSkills": [
                    {
                        "id": 1,
                        "name": "Precision Shot",
                        "baseValue": 70,
                        "value": 85,
                        "hitGuarantee": true
                    },
                    {
                        "id": 2,
                        "name": "Rapid Fire",
                        "baseValue": 50,
                        "value": 65,
                        "hitGuarantee": false
                    }
                ],
                "improvementSkill": [
                    {
                        "id": 3,
                        "name": "Range Mastery",
                        "baseValue": 30,
                        "value": 40,
                        "improves": "distance",
                        "factor": 3,
                    },
                    {
                        "id": 4,
                        "name": "Wind Resistance",
                        "baseValue": 20,
                        "value": 25,
                        "improves": "movement",
                        "factor": 5,
                        "canReduceBelowZero": false
                    }
                ],
                "weaponModifiers": [
                    {
                        "minimum": 1,
                        "maximum": 10,
                        "modifier": 2
                    },
                    {
                        "minimum": 11,
                        "maximum": 20,
                        "modifier": 3
                    }
                ]
            },
            {
                "name": "Crossbow",
                "shootSkills": [
                    {
                        "id": 5,
                        "name": "Bolt Shot",
                        "baseValue": 60,
                        "value": 75,
                        "hitGuarantee": false
                    },
                    {
                        "id": 6,
                        "name": "Piercing Bolt",
                        "baseValue": 55,
                        "value": 70,
                        "hitGuarantee": true
                    }
                ],
                "improvementSkill": [
                    {
                        "id": 7,
                        "name": "Reload Speed",
                        "baseValue": 25,
                        "value": 35,
                        "improves": "movement",
                        "factor": 3
                    },
                    {
                        "id": 8,
                        "name": "Armor Penetration",
                        "baseValue": 40,
                        "value": 50,
                        "improves": "weapon",
                        "factor": 2
                    }
                ],
                "weaponModifiers": [
                    {
                        "minimum": 1,
                        "maximum": 15,
                        "modifier": 1
                    },
                    {
                        "minimum": 16,
                        "maximum": 25,
                        "modifier": 4
                    }
                ]
            }
        ]
    },
    {
        "name": "Warrior",
        "weapons": [
            {
                "name": "Greatsword",
                "shootSkills": [
                    {
                        "id": 9,
                        "name": "Heavy Swing",
                        "baseValue": 80,
                        "value": 90,
                        "hitGuarantee": true
                    },
                    {
                        "id": 10,
                        "name": "Whirlwind Attack",
                        "baseValue": 65,
                        "value": 75,
                        "hitGuarantee": false
                    }
                ],
                "improvementSkill": [
                    {
                        "id": 11,
                        "name": "Blade Sharpness",
                        "baseValue": 35,
                        "value": 45,
                        "improves": "weapon",
                        "factor": 1.4
                    },
                    {
                        "id": 12,
                        "name": "Endurance",
                        "baseValue": 50,
                        "value": 60,
                        "improves": "total",
                        "factor": 1.2
                    }
                ],
                "weaponModifiers": [
                    {
                        "minimum": 1,
                        "maximum": 5,
                        "modifier": 5
                    },
                    {
                        "minimum": 6,
                        "maximum": 10,
                        "modifier": 6
                    }
                ]
            },
            {
                "name": "Battle Axe",
                "shootSkills": [
                    {
                        "id": 13,
                        "name": "Chop",
                        "baseValue": 70,
                        "value": 80,
                        "hitGuarantee": false
                    },
                    {
                        "id": 14,
                        "name": "Berserk Strike",
                        "baseValue": 60,
                        "value": 70,
                        "hitGuarantee": true
                    }
                ],
                "improvementSkill": [
                    {
                        "id": 15,
                        "name": "Axe Mastery",
                        "baseValue": 40,
                        "value": 50,
                        "improves": "size",
                        "factor": 1.3
                    },
                    {
                        "id": 16,
                        "name": "Rage",
                        "baseValue": 45,
                        "value": 55,
                        "improves": "total",
                        "factor": 1.5,
                        "canReduceBelowZero": true
                    }
                ],
                "weaponModifiers": [
                    {
                        "minimum": 1,
                        "maximum": 7,
                        "modifier": 3
                    },
                    {
                        "minimum": 8,
                        "maximum": 12,
                        "modifier": 4
                    }
                ]
            }
        ]
    }
]
