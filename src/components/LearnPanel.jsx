const POWERS_OF_TWO = Array.from({ length: 11 }, (_, n) => ({ n, value: 2 ** n }));

const NIBBLES = Array.from({ length: 16 }, (_, n) => ({
  hex: n.toString(16).toUpperCase(),
  binary: n.toString(2).padStart(4, '0'),
  decimal: n,
}));

const WIDTHS = [8, 16, 32, 64].map((width) => {
  const span = 1n << BigInt(width);
  return {
    width,
    unsignedMax: (span - 1n).toLocaleString(),
    signedMin: (-(span >> 1n)).toLocaleString().replace('-', '−'),
    signedMax: ((span >> 1n) - 1n).toLocaleString(),
  };
});

export default function LearnPanel() {
  return (
    <div className="learn-panel fade-in">
      <div className="learn-content">
        <h1 className="learn-title">Understanding Numbering Systems (Radix)</h1>
        <p className="learn-text">
          A numbering system, or <strong>radix</strong>, defines how many unique digits exist before you must carry over to a new column. In everyday life, we use Base 10 (Decimal). Computers, built on transistors that are either on or off, use Base 2 (Binary). To make binary easier for humans to read, programmers use Base 16 (Hexadecimal) and Base 8 (Octal).
        </p>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">1. The Anchor: Decimal (Base 10)</h2>
        <p className="learn-text">
          Before looking at computer systems, you have to understand how our everyday system works under the hood. Base 10 has ten digits: <code>0</code> through <code>9</code>. Every position in a number represents a power of the base, starting from zero on the right.
        </p>
        
        <div className="learn-example">
          <div className="learn-example-title">Example: The number 425</div>
          <ul className="learn-list">
            <li>The <code>5</code> is in the 10⁰ (ones) position: 5 × 1 = 5</li>
            <li>The <code>2</code> is in the 10¹ (tens) position: 2 × 10 = 20</li>
            <li>The <code>4</code> is in the 10² (hundreds) position: 4 × 100 = 400</li>
            <li><strong>Total:</strong> 400 + 20 + 5 = <strong>425</strong></li>
          </ul>
        </div>
        <p className="learn-text">
          This exact mathematical rule—multiplying a digit by the base raised to its position—applies to <em>every</em> numbering system.
        </p>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">2. Binary (Base 2)</h2>
        <p className="learn-text">
          Binary has only two digits: <code>0</code> and <code>1</code>. Each position represents a power of 2 (1, 2, 4, 8, 16, 32, etc.).
        </p>

        <h3 className="learn-subtitle">Converting Binary to Decimal (Positional Weight Method)</h3>
        <p className="learn-text">
          To find the decimal value of a binary number, multiply each bit by its positional power of 2 and sum them.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 1011 (Base 2) to Decimal</div>
          <p className="learn-text" style={{ marginBottom: '8px' }}>Read from right to left (Position 0 to 3):</p>
          <ul className="learn-list">
            <li>Position 0: <code>1</code> × 2⁰ (1) = 1</li>
            <li>Position 1: <code>1</code> × 2¹ (2) = 2</li>
            <li>Position 2: <code>0</code> × 2² (4) = 0</li>
            <li>Position 3: <code>1</code> × 2³ (8) = 8</li>
            <li><strong>Total:</strong> 8 + 0 + 2 + 1 = <strong>11 (Base 10)</strong></li>
          </ul>
        </div>

        <h3 className="learn-subtitle">Converting Decimal to Binary (Repeated Division Method)</h3>
        <p className="learn-text">
          To go from decimal to binary, divide the number by 2 repeatedly. The remainders, read from the bottom up, form the binary number.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 13 (Base 10) to Binary</div>
          <ul className="learn-list">
            <li>13 ÷ 2 = 6, remainder <strong>1</strong> (Rightmost digit)</li>
            <li>6 ÷ 2 = 3, remainder <strong>0</strong></li>
            <li>3 ÷ 2 = 1, remainder <strong>1</strong></li>
            <li>1 ÷ 2 = 0, remainder <strong>1</strong> (Leftmost digit)</li>
            <li><strong>Result:</strong> Read bottom to top → <strong>1101 (Base 2)</strong></li>
          </ul>
        </div>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">3. Hexadecimal (Base 16)</h2>
        <p className="learn-text">
          Binary strings get dangerously long very quickly (e.g., a simple color code like white is <code>111111111111111111111111</code>). Hexadecimal compresses this.
        </p>
        <p className="learn-text">
          Base 16 needs sixteen digits. Since we only have 0-9, we use letters for the values 10 through 15:
          <br /><code>0 1 2 3 4 5 6 7 8 9 A(10) B(11) C(12) D(13) E(14) F(15)</code>
        </p>
        <p className="learn-text">
          <strong>Why 16?</strong> Because 16 is 2⁴. This means exactly four binary digits (bits) map perfectly to exactly one hexadecimal digit. It is a direct shorthand for binary.
        </p>

        <h3 className="learn-subtitle">Converting Hex to Decimal</h3>
        <p className="learn-text">
          Using the positional weight rule, but with powers of 16 (1, 16, 256, 4096...).
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 2A (Base 16) to Decimal</div>
          <ul className="learn-list">
            <li>Position 0: <code>A</code> (10) × 16⁰ (1) = 10</li>
            <li>Position 1: <code>2</code> × 16¹ (16) = 32</li>
            <li><strong>Total:</strong> 32 + 10 = <strong>42 (Base 10)</strong></li>
          </ul>
        </div>

        <h3 className="learn-subtitle">The Hex-to-Binary Shortcut</h3>
        <p className="learn-text">
          Because of the 4-to-1 relationship, you do not need to convert to decimal first. You just translate each hex digit into its 4-bit binary equivalent.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 2A to Binary</div>
          <ul className="learn-list">
            <li><code>2</code> in 4-bit binary is <code>0010</code></li>
            <li><code>A</code> (10) in 4-bit binary is <code>1010</code></li>
            <li><strong>Result:</strong> <strong>0010 1010</strong></li>
          </ul>
        </div>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">4. Octal (Base 8)</h2>
        <p className="learn-text">
          Octal uses eight digits, <code>0</code> through <code>7</code>. Each position is a
          power of 8 (<code>1, 8, 64, 512…</code>), and each octal digit maps to exactly
          three binary bits. It is less common than hex today, but it still shows up where
          bits are grouped in threes, most visibly in Unix file permissions.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 755 (Base 8) to Decimal</div>
          <ul className="learn-list">
            <li><code>5</code> × 8⁰ (1) = 5</li>
            <li><code>5</code> × 8¹ (8) = 40</li>
            <li><code>7</code> × 8² (64) = 448</li>
            <li><strong>Total:</strong> 448 + 40 + 5 = <strong>493 (Base 10)</strong></li>
          </ul>
        </div>
        <p className="learn-text">
          That is why <code>chmod 755</code> means <em>rwxr-xr-x</em>: the three octal digits
          are three permission bits each — read, write and execute.
        </p>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">5. Fractional Conversions (The Dot)</h2>
        <p className="learn-text">
          What happens after the decimal point? The powers simply become negative. In Base 10, positions after the dot are 10⁻¹ (0.1), 10⁻² (0.01). In Binary, positions after the dot are 2⁻¹ (0.5), 2⁻² (0.25), 2⁻³ (0.125).
        </p>
        <h3 className="learn-subtitle">Converting Decimal Fractions to Target Base</h3>
        <p className="learn-text">
          Instead of repeated division, you use <strong>repeated multiplication</strong>.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">Example: Convert 0.625 (Base 10) to Binary</div>
          <ul className="learn-list">
            <li>0.625 × 2 = 1.25. The whole number is <strong>1</strong>. Keep the fractional part (0.25).</li>
            <li>0.25 × 2 = 0.50. The whole number is <strong>0</strong>. Keep the fractional part (0.50).</li>
            <li>0.50 × 2 = 1.00. The whole number is <strong>1</strong>. Fraction is 0, so stop.</li>
            <li><strong>Result:</strong> Read top to bottom → <strong>0.101 (Base 2)</strong></li>
          </ul>
        </div>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">6. Real-World Computer Contexts</h2>
        
        <h3 className="learn-subtitle">Bit Widths (Hardware Limits)</h3>
        <p className="learn-text">
          A computer allocates a specific physical amount of memory for a number—usually 8, 16, 32, or 64 bits. If you try to store the number 256 (binary <code>1 0000 0000</code>, which is 9 bits) in an 8-bit space, the leftmost <code>1</code> is truncated. The machine will think the number is 0. This is an <strong>overflow</strong>.
        </p>

        <h3 className="learn-subtitle">Two's Complement (Negative Numbers)</h3>
        <p className="learn-text">
          Computers do not have a physical minus sign. They must represent negative numbers using bits. The standard method is Two's Complement.
        </p>
        <div className="learn-example">
          <div className="learn-example-title">To find -5 in 8-bit binary:</div>
          <ul className="learn-list">
            <li>Write the positive version: <code>0000 0101</code></li>
            <li>Flip all bits (NOT operation): <code>1111 1010</code></li>
            <li>Add 1: <code>1111 1011</code></li>
          </ul>
        </div>
        <p className="learn-text">
          The leftmost bit (the most significant bit) now acts as a sign bit. If it is 1, the hardware interprets the number as negative.
        </p>

        <h3 className="learn-subtitle">IEEE 754 (Floating Point)</h3>
        <p className="learn-text">
          Hardware cannot natively store repeating fractions or incredibly massive numbers. To solve this, computers use a system similar to scientific notation (e.g., <code>1.23 × 10⁴</code>), called IEEE 754. It splits a 32-bit or 64-bit space into three chunks:
        </p>
        <ul className="learn-list">
          <li><strong>Sign bit:</strong> Positive or negative.</li>
          <li><strong>Exponent:</strong> Where the decimal point goes (the power of 2).</li>
          <li><strong>Mantissa (Fraction):</strong> The actual precision digits of the number.</li>
        </ul>

        <hr className="divider" style={{ margin: '32px 0' }} />

        <h2 className="learn-section-title">7. Quick Reference</h2>

        <h3 className="learn-subtitle">Powers of two</h3>
        <p className="learn-text">
          Each bit position is worth a power of two. Add the weights where the bit is 1.
        </p>
        <div className="ref-grid">
          {POWERS_OF_TWO.map(({ n, value }) => (
            <div className="ref-cell" key={n}>
              <span>2<sup>{n}</sup></span>
              <strong>{value.toLocaleString()}</strong>
            </div>
          ))}
        </div>

        <h3 className="learn-subtitle">One hex digit, four bits</h3>
        <p className="learn-text">
          Every hexadecimal digit maps to exactly four binary bits, which is why hex is
          shorthand for binary.
        </p>
        <div className="ref-grid ref-grid-hex">
          {NIBBLES.map(({ hex, binary, decimal }) => (
            <div className="ref-cell" key={hex} title={`${decimal} decimal`}>
              <span>{hex}</span>
              <strong>{binary}</strong>
            </div>
          ))}
        </div>

        <h3 className="learn-subtitle">Register widths</h3>
        <p className="learn-text">
          An unsigned value uses every bit. A signed value gives up the top bit for the
          sign, which halves the positive range.
        </p>
        <div className="ref-table-scroll">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Width</th>
                <th>Unsigned</th>
                <th>Signed</th>
              </tr>
            </thead>
            <tbody>
              {WIDTHS.map(({ width, unsignedMax, signedMin, signedMax }) => (
                <tr key={width}>
                  <td>{width}-bit</td>
                  <td>0 … {unsignedMax}</td>
                  <td>{signedMin} … {signedMax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="learn-subtitle">Prefixes in source code</h3>
        <p className="learn-text">
          Most languages let you write the base inline. C and older JavaScript use a bare
          leading zero for octal (<code>0755</code>), which is easy to misread — prefer{' '}
          <code>0o</code> where it is supported.
        </p>
        <div className="ref-table-scroll">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Prefix</th>
                <th>Base</th>
                <th>Example</th>
                <th>Decimal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0b</td><td>2</td><td>0b1010</td><td>10</td></tr>
              <tr><td>0o</td><td>8</td><td>0o755</td><td>493</td></tr>
              <tr><td>0x</td><td>16</td><td>0x2A</td><td>42</td></tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
