import { Link } from "react-router-dom"
import { ArrowLeft, Shield, Pill, Users, CheckCircle, TrendingDown, Clock, Award } from "lucide-react"

export default function Substitutes() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/" className="p-1 hover:bg-accent rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Medicine Substitutes</h1>
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Understand why Substitutes are the <span className="text-primary">smarter choice</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Generic medicines offer the same therapeutic benefits as branded drugs while being significantly more
            affordable. Save money without compromising on quality.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-foreground">FDA Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-foreground">Same Composition</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <span className="text-foreground">Up to 51% Cheaper</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card py-12 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">51%</div>
              <div className="text-sm text-muted-foreground">Average Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Same Quality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1%</div>
              <div className="text-sm text-muted-foreground">Top Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24h</div>
              <div className="text-sm text-muted-foreground">Delivery Time</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How are Substitutes Safe?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              They have the same attributes as your prescribed medicine and follow the same biological pathway.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Absorption */}
            <div className="text-center p-6 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full relative">
                  <div className="absolute inset-1 bg-background rounded-full"></div>
                  <div className="absolute inset-2 bg-blue-300 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Absorption</h4>
              <p className="text-sm text-muted-foreground">What happens when the patient consumes the medicine</p>
            </div>

            {/* Distribution */}
            <div className="text-center p-6 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Distribution</h4>
              <p className="text-sm text-muted-foreground">How drug is distributed in the blood</p>
            </div>

            {/* Metabolism */}
            <div className="text-center p-6 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Metabolism</h4>
              <p className="text-sm text-muted-foreground">How body's metabolism reacts to the drug</p>
            </div>

            {/* Excretion */}
            <div className="text-center p-6 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-xl"></div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Excretion</h4>
              <p className="text-sm text-muted-foreground">Waste that is excreted from the body</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">MEC:</span> Minimum effective concentration
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">MSC:</span> Maximum safe concentration
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Award className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Quality:</span> Same therapeutic effect
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Time:</span> Same onset duration
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Same are these medicines?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generic medicines are bioequivalent to branded drugs in every aspect that matters.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-8 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Same Composition</h4>
              <p className="text-muted-foreground">
                Identical molecule & salt composition ensures same therapeutic effect
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pill className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Same Dosage</h4>
              <p className="text-muted-foreground">Identical strength and dosage for consistent treatment outcomes</p>
            </div>

            <div className="text-center p-8 bg-card rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Same Effect</h4>
              <p className="text-muted-foreground">Identical medicinal effect with same safety profile</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Can I Save on Medicines?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose generic substitutes and enjoy significant savings without compromising on quality.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 md:p-12 border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl font-bold text-green-600">₹</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Save up to 51% on medicines</h4>
                <p className="text-lg text-muted-foreground mb-6">
                  Place your order by opting for substitutes and have it delivered at your door-step with the same
                  quality assurance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                    <span>51% cheaper</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                    <span>Same quality</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                    <span>Fast delivery</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">₹500</div>
                  <div className="text-sm text-muted-foreground">Branded Medicine</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">₹245</div>
                  <div className="text-sm text-green-600">Generic Substitute</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-card p-12 rounded-2xl border">
          <h4 className="text-2xl font-bold text-foreground mb-4">Ready to start saving on medicines?</h4>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of customers who have already switched to generic medicines and are saving money every month.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Ordering Now
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
