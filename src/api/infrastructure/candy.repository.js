export class CandyRepository {
    async get (candyId = undefined) {
        const candies = [
            { id: '1', name: 'brown sugar', sugar_level: 'down', description: "provoque la pertes des dents" },
            { id: '2', name: 'coké cola', sugar_level: 'high', description: "ça pique le nez" },
            { id: '3', name: 'crystal mint', sugar_level: 'high', description: "une claque rafraîchissante" },
            { id: '4', name: 'spice cake', sugar_level: 'down', description: "laisse thomas tranquille" },
            { id: '5', name: 'soucoupe acide', sugar_level: 'down', description: "un voyage interstellaire" },
        ]

        if (candyId) {
            return candies.filter(candy => candy.id === candyId)
        }
        return candies
    }

    async save (name, sugarLevel, description) {
        return { id: '99', name: name, sugar_level: sugarLevel, description: description }
    }
}